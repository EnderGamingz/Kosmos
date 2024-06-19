use axum::extract::{Path, Query, State};
use axum::extract::rejection::PathRejection;
use axum::Json;
use axum_valid::Valid;
use serde::Deserialize;
use tower_sessions::Session;
use validator::Validate;

use crate::model::file::FileType;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::auth::file::{MoveParams, ParsedSortParams, RenameParams, SortOrder, SortParams};
use crate::services::folder_service::FolderService;
use crate::services::session_service::{SessionService, UserId};
use crate::state::{AppState, KosmosState};

#[derive(Deserialize, Debug, PartialEq)]
pub enum SortByFolders {
    Name,
    CreatedAt,
    UpdatedAt,
}

pub async fn get_folders(
    State(state): KosmosState,
    session: Session,
    Query(sort_params): Query<SortParams<SortByFolders>>,
    folder_id: Result<Path<i64>, PathRejection>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let parent = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };

    let parsed_params = ParsedSortParams {
        sort_order: sort_params.sort_order.unwrap_or(SortOrder::Asc),
        sort_by: sort_params.sort_by.unwrap_or(SortByFolders::Name),
        limit: sort_params.limit.unwrap_or(200),
        offset: sort_params.offset.unwrap_or(0),
    };

    let folders = state
        .folder_service
        .get_folders(user_id, parent, parsed_params)
        .await?
        .into_iter()
        .map(FolderService::parse_folder)
        .collect::<Vec<_>>();

    let folder = if let Some(folder) = parent {
        Some(FolderService::parse_folder(
            state.folder_service.get_folder(folder).await?,
        ))
    } else {
        None
    };

    let structure = if let Some(folder) = parent {
        Some(
            state
                .folder_service
                .get_children_directories(folder, user_id)
                .await?
                .into_iter()
                .map(FolderService::parse_children_directory)
                .collect::<Vec<_>>(),
        )
    } else {
        None
    };

    Ok(Json(serde_json::json!({
        "folder": folder,
        "folders": folders,
        "structure": structure
    })))
}

#[derive(Deserialize, Validate)]
pub struct FolderRequest {
    #[validate(length(min = 1, message = "Name cannot be empty"))]
    name: String,
}

pub async fn create_folder(
    State(state): KosmosState,
    session: Session,
    folder_id: Result<Path<i64>, PathRejection>,
    Valid(Json(payload)): Valid<Json<FolderRequest>>,
) -> Result<Json<serde_json::Value>, AppError> {
    let folder_id = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };
    let user_id = SessionService::check_logged_in(&session).await?;
    let does_folder_exist = state
        .folder_service
        .check_folder_exists_by_name(&payload.name, user_id, folder_id)
        .await?;

    if does_folder_exist.is_some() {
        return Err(AppError::Forbidden {
            error: Some("Folder already exists".to_string()),
        });
    }

    let folder = state
        .folder_service
        .create_folder(user_id, payload.name, folder_id)
        .await?
        .to_string();

    Ok(Json(serde_json::json!(folder)))
}

#[derive(Deserialize)]
pub struct MultiDeleteRawBody {
    folders: Vec<String>,
    files: Vec<String>,
}

pub struct MultiDeleteBody {
    folders: Vec<i64>,
    files: Vec<i64>,
}

pub async fn multi_delete(
    State(state): KosmosState,
    session: Session,
    Json(body): Json<MultiDeleteRawBody>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let body = MultiDeleteBody {
        folders: body
            .folders
            .iter()
            .map(|id| {
                id.parse::<i64>().map_err(|_| {
                    return AppError::BadRequest {
                        error: Some("Error parsing folder id".to_string()),
                    };
                })
            })
            .collect::<Result<Vec<_>, _>>()?,
        files: body
            .files
            .iter()
            .map(|id| {
                id.parse::<i64>().map_err(|_| {
                    return AppError::BadRequest {
                        error: Some("Error parsing file id".to_string()),
                    };
                })
            })
            .collect::<Result<Vec<_>, _>>()?,
    };

    for folder_id in body.folders {
        delete_folder_with_structure(&state, folder_id, user_id).await?;
    }

    for file_id in body.files {
        let file = state
            .file_service
            .check_file_exists_by_id(file_id, user_id)
            .await?
            .ok_or(AppError::NotFound {
                error: "File not found".to_string(),
            })?;
        state
            .file_service
            .permanently_delete_file(file_id, Some(FileType::get_type_by_id(file.file_type)))
            .await?;
    }

    Ok(AppSuccess::DELETED)
}

async fn delete_folder_with_structure(
    state: &AppState,
    folder_id: i64,
    user_id: UserId,
) -> Result<(), AppError> {
    if state
        .folder_service
        .check_folder_exists_by_id(folder_id, user_id)
        .await?
        .is_none()
    {
        return Err(AppError::NotFound {
            error: "Folder not found".to_string(),
        });
    }

    let structure = state
        .folder_service
        .get_deletion_directories(folder_id, user_id)
        .await?;

    for folder in structure {
        for i in 0..folder.file_ids.len() {
            state
                .file_service
                .permanently_delete_file(
                    folder.file_ids[i],
                    Some(FileType::get_type_by_id(folder.file_types[i])),
                )
                .await?;
        }

        state.folder_service.delete_folder(folder.id).await?;
    }

    state.folder_service.delete_folder(folder_id).await?;

    Ok(())
}

pub async fn delete_folder(
    State(state): KosmosState,
    session: Session,
    Path(folder_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    if state
        .folder_service
        .check_folder_exists_by_id(folder_id, user_id)
        .await?
        .is_none()
    {
        return Err(AppError::NotFound {
            error: "Folder not found".to_string(),
        });
    }

    if state
        .folder_service
        .check_folder_contains_elements(folder_id)
        .await?
    {
        return Err(AppError::DataConflict {
            error: "Folder is not empty".to_string(),
        });
    }

    state.folder_service.delete_folder(folder_id).await?;

    Ok(AppSuccess::DELETED)
}

pub async fn move_folder(
    State(state): KosmosState,
    session: Session,
    Path(folder_id): Path<i64>,
    params: Option<Query<MoveParams>>,
) -> ResponseResult {
    let move_to_folder = params.map(|params| params.folder_id);

    let user_id = SessionService::check_logged_in(&session).await?;

    let folder = match state
        .folder_service
        .check_folder_exists_by_id(folder_id, user_id)
        .await?
    {
        None => {
            return Err(AppError::NotFound {
                error: "Folder not found".to_string(),
            })
        }
        Some(folder) => folder,
    };

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

    let is_folder_already_in_destination = state
        .folder_service
        .check_folder_exists_in_folder(&folder.folder_name, move_to_folder)
        .await?;

    if is_folder_already_in_destination {
        return Err(AppError::DataConflict {
            error: "Folder already exists in destination folder".to_string(),
        });
    }

    state
        .folder_service
        .move_folder(user_id, folder_id, move_to_folder)
        .await?;

    Ok(AppSuccess::MOVED)
}

pub async fn rename_folder(
    State(state): KosmosState,
    session: Session,
    Path(folder_id): Path<i64>,
    Valid(Json(payload)): Valid<Json<RenameParams>>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let folder = state
        .folder_service
        .check_folder_exists_by_id(folder_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "Folder not found".to_string(),
        })?;

    state
        .folder_service
        .rename_folder(user_id, folder_id, payload.name, folder.parent_id)
        .await?;

    Ok(AppSuccess::UPDATED)
}
