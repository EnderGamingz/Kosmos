use axum::extract::rejection::PathRejection;
use axum::extract::{Path, Query, State};
use axum::Json;
use axum_jwt_auth::Claims;
use axum_valid::Valid;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::model::file::FileModelDTO;
use crate::model::internal::entity_id::OptionEntityId;
use crate::model::internal::file_type::FileType;
use crate::model::internal::presence::index::{PresenceAction, PresenceMessage};
use crate::model::internal::presence::messages::PresenceExplorerUpdate;
use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::auth::folder::SortByFolders;
use crate::state::KosmosState;

pub static FILE_SIZE_LIMIT: u64 = 50 * 1024 * 1024;

#[derive(Debug, Deserialize, PartialEq)]
pub enum SortOrder {
    Asc,
    Desc,
}

#[derive(Deserialize, Debug, PartialEq)]
pub enum SortByFiles {
    Name,
    FileSize,
    CreatedAt,
    UpdatedAt,
}

#[derive(Deserialize)]
pub struct GetFilesSortParams<SortBy> {
    pub sort_order: Option<SortOrder>,
    pub sort_by: Option<SortBy>,
    pub limit: Option<i64>,
    pub page: Option<i64>,
    pub album_files: Option<bool>,
}

impl GetFilesSortParams<SortByFiles> {
    pub fn get_sort_order(&self) -> &SortOrder {
        self.sort_order.as_ref().unwrap_or(&SortOrder::Asc)
    }

    pub fn get_sort_by(&self) -> &SortByFiles {
        self.sort_by.as_ref().unwrap_or(&SortByFiles::Name)
    }

    pub fn get_limit(&self) -> i64 {
        self.limit.unwrap_or(50)
    }

    pub fn get_page(&self) -> i64 {
        self.page.unwrap_or(0)
    }
}

impl GetFilesSortParams<SortByFolders> {
    pub fn get_sort_order(&self) -> &SortOrder {
        self.sort_order.as_ref().unwrap_or(&SortOrder::Asc)
    }

    pub fn get_sort_by(&self) -> &SortByFolders {
        self.sort_by.as_ref().unwrap_or(&SortByFolders::Name)
    }

    pub fn get_limit(&self) -> i64 {
        self.limit.unwrap_or(50)
    }

    pub fn get_page(&self) -> i64 {
        self.page.unwrap_or(0)
    }
}

pub async fn get_files(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Query(sort_params): Query<GetFilesSortParams<SortByFiles>>,
    folder_id: Result<Path<i64>, PathRejection>,
) -> Result<Json<Vec<FileModelDTO>>, AppError> {
    let folder = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };

    let files = state
        .file_service
        .get_files(claims.user.user_id, folder, false, sort_params)
        .await?
        .into_iter()
        .map(FileModelDTO::from)
        .collect();

    Ok(Json(files))
}

#[derive(Deserialize)]
pub struct GetRecentFilesParams {
    pub limit: Option<i64>,
    pub page: Option<i64>,
}

impl GetRecentFilesParams {
    pub fn get_limit(&self) -> i64 {
        self.limit.unwrap_or(50)
    }

    pub fn get_page(&self) -> i64 {
        self.page.unwrap_or(0)
    }
}

pub async fn get_recent_files(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Query(params): Query<GetRecentFilesParams>,
) -> Result<Json<Vec<FileModelDTO>>, AppError> {
    let files = state
        .file_service
        .get_recent_files(claims.user.user_id, params)
        .await?
        .into_iter()
        .map(FileModelDTO::from)
        .collect();

    Ok(Json(files))
}

pub async fn get_deleted_files(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
) -> Result<Json<Vec<FileModelDTO>>, AppError> {
    let files = state
        .file_service
        .get_marked_deleted_files(claims.user.user_id)
        .await?
        .into_iter()
        .map(FileModelDTO::from)
        .collect();

    Ok(Json(files))
}

#[derive(Deserialize)]
pub struct GetFilesByType {
    pub limit: Option<i32>,
    pub page: Option<i32>,
}

impl GetFilesByType {
    pub fn get_limit(&self) -> i64 {
        self.limit.unwrap_or(50) as i64
    }

    pub fn get_page(&self) -> i64 {
        self.page.unwrap_or(0) as i64
    }
}

pub async fn get_file_by_type(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(file_type): Path<i16>,
    Query(params): Query<GetFilesByType>,
) -> Result<Json<Vec<FileModelDTO>>, AppError> {
    let file_type = FileType::new(file_type);

    let files = state
        .file_service
        .get_files_by_file_type(
            claims.user.user_id,
            vec![file_type],
            params.get_limit(),
            params.get_page(),
        )
        .await?
        .into_iter()
        .map(FileModelDTO::from)
        .collect();

    Ok(Json(files))
}

#[derive(Deserialize)]
pub struct CreateMarkdownFilePayload {
    pub name: String,
    pub parent_folder_id: OptionEntityId,
}

pub async fn create_markdown_file(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Json(payload): Json<CreateMarkdownFilePayload>,
) -> ResponseResult {
    let file_name = payload.name.trim().to_string();
    let parent_folder_id = payload.parent_folder_id.into();

    let file_exists = state
        .file_service
        .check_file_exists_in_folder(&file_name, parent_folder_id)
        .await?;

    if file_exists {
        return Err(AppError::BadRequest {
            error: Some("File already exists in this folder".to_string()),
        });
    }

    let id = state
        .file_service
        .create_empty_markdown_file(claims.user.user_id, parent_folder_id, file_name)
        .await?
        .id;

    state
        .presence_handler
        .broadcast_to_user(
            claims.user.user_id,
            PresenceMessage {
                action: PresenceAction::ExplorerUpdate(PresenceExplorerUpdate {
                    folder_id: parent_folder_id.map(|f| f.to_string()),
                }),
                important: false,
            },
        )
        .await;

    Ok(AppSuccess::CREATED {
        id: Some(id.to_string()),
    })
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct MoveParams {
    pub folder_id: Option<i64>,
}

pub async fn move_file(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(file_id): Path<i64>,
    Query(params): Query<MoveParams>,
) -> ResponseResult {
    // Check if file exists and returns not found if it doesn't
    let file = state
        .file_service
        .check_file_exists_by_id(file_id, claims.user.user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    if let Some(move_to_folder) = params.folder_id {
        if state
            .folder_service
            .check_folder_exists_by_id(move_to_folder, claims.user.user_id)
            .await?
            .is_none()
        {
            return Err(AppError::NotFound {
                error: "Folder not found".to_string(),
            });
        }
    }

    let is_file_already_in_destination_folder = state
        .file_service
        .check_file_exists_in_folder(&file.file_name, params.folder_id)
        .await?;

    if is_file_already_in_destination_folder {
        return Err(AppError::BadRequest {
            error: Some("File already exists in destination folder".to_string()),
        });
    }

    state
        .file_service
        .move_file(claims.user.user_id, file_id, params.folder_id)
        .await?;

    state
        .presence_handler
        .broadcast_to_user(
            claims.user.user_id,
            PresenceMessage {
                action: PresenceAction::ExplorerUpdate(PresenceExplorerUpdate { folder_id: None }),
                important: false,
            },
        )
        .await;

    Ok(AppSuccess::MOVED)
}

#[derive(Deserialize, Validate)]
pub struct RenameParams {
    #[validate(length(min = 1, message = "Name cannot be empty"))]
    pub name: String,
}

pub async fn rename_file(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(file_id): Path<i64>,
    Valid(Json(params)): Valid<Json<RenameParams>>,
) -> ResponseResult {
    let file = state
        .file_service
        .check_file_exists_by_id(file_id, claims.user.user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    state
        .file_service
        .rename_file(
            claims.user.user_id,
            file.id,
            params.name,
            file.parent_folder_id,
        )
        .await?;

    state
        .presence_handler
        .broadcast_to_user(
            claims.user.user_id,
            PresenceMessage {
                action: PresenceAction::ExplorerUpdate(PresenceExplorerUpdate {
                    folder_id: file.parent_folder_id.map(|f| f.to_string()),
                }),
                important: false,
            },
        )
        .await;

    Ok(AppSuccess::UPDATED)
}
