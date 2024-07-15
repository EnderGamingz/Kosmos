use axum::extract::{Path, Query, State};
use axum::extract::rejection::PathRejection;
use axum::Json;
use axum_valid::Valid;
use serde::Deserialize;
use tower_sessions::Session;
use validator::Validate;

use crate::model::file::{FileModelDTO, FileType};
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::auth::folder::SortByFolders;
use crate::services::session_service::SessionService;
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
    State(state): KosmosState,
    session: Session,
    Query(sort_params): Query<GetFilesSortParams<SortByFiles>>,
    folder_id: Result<Path<i64>, PathRejection>,
) -> Result<Json<Vec<FileModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let folder = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };

    let files = state
        .file_service
        .get_files(user_id, folder, false, sort_params)
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
    State(state): KosmosState,
    session: Session,
    Query(params): Query<GetRecentFilesParams>,
) -> Result<Json<Vec<FileModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let files = state
        .file_service
        .get_recent_files(user_id, params)
        .await?
        .into_iter()
        .map(FileModelDTO::from)
        .collect();

    Ok(Json(files))
}

pub async fn get_deleted_files(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<Vec<FileModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let files = state
        .file_service
        .get_marked_deleted_files(user_id)
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
    fn get_limit(&self) -> i64 {
        self.limit.unwrap_or(50) as i64
    }

    fn get_page(&self) -> i64 {
        self.page.unwrap_or(0) as i64
    }
}

pub async fn get_file_by_type(
    State(state): KosmosState,
    session: Session,
    Path(file_type): Path<i16>,
    Query(params): Query<GetFilesByType>,
) -> Result<Json<Vec<FileModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let file_type = FileType::by_id(file_type);

    let files = state
        .file_service
        .get_files_by_file_type(user_id, file_type, params.get_limit(), params.get_page())
        .await?
        .into_iter()
        .map(FileModelDTO::from)
        .collect();

    Ok(Json(files))
}

#[derive(Deserialize)]
pub struct MoveParams {
    pub folder_id: i64,
}

pub async fn move_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
    params: Option<Query<MoveParams>>,
) -> ResponseResult {
    let move_to_folder = params.map(|params| params.folder_id);

    let user_id = SessionService::check_logged_in(&session).await?;

    // Check if file exists and returns not found if it doesn't
    let file = state
        .file_service
        .check_file_exists_by_id(file_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    if let Some(move_to_folder) = move_to_folder {
        if !state
            .folder_service
            .check_folder_exists_by_id(move_to_folder, user_id)
            .await?
            .is_some()
        {
            return Err(AppError::NotFound {
                error: "Folder not found".to_string(),
            });
        }
    }

    let is_file_already_in_destination_folder = state
        .file_service
        .check_file_exists_in_folder(&file.file_name, move_to_folder)
        .await?;

    if is_file_already_in_destination_folder {
        return Err(AppError::BadRequest {
            error: Some("File already exists in destination folder".to_string()),
        });
    }

    state
        .file_service
        .move_file(user_id, file_id, move_to_folder)
        .await?;

    Ok(AppSuccess::MOVED)
}

#[derive(Deserialize, Validate)]
pub struct RenameParams {
    #[validate(length(min = 1, message = "Name cannot be empty"))]
    pub name: String,
}

pub async fn rename_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
    Valid(Json(params)): Valid<Json<RenameParams>>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let file = state
        .file_service
        .check_file_exists_by_id(file_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    state
        .file_service
        .rename_file(user_id, file.id, params.name, file.parent_folder_id)
        .await?;

    Ok(AppSuccess::UPDATED)
}
