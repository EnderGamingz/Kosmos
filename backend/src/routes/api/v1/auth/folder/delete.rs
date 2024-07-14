use axum::extract::{Path, State};
use tower_sessions::Session;
use axum::Json;
use serde::Deserialize;
use crate::model::file::FileType;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::{SessionService, UserId};
use crate::state::{AppState, KosmosState};

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
            .permanently_delete_file(file_id, Some(FileType::by_id(file.file_type)))
            .await?;
    }

    Ok(AppSuccess::DELETED)
}

async fn delete_folder_with_structure(
    state: &AppState,
    folder_id: i64,
    user_id: UserId,
) -> ResponseResult {
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
                    Some(FileType::by_id(folder.file_types[i])),
                )
                .await?;
        }

        state.folder_service.delete_folder(folder.id).await?;
    }

    state.folder_service.delete_folder(folder_id).await?;

    Ok(AppSuccess::DELETED)
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