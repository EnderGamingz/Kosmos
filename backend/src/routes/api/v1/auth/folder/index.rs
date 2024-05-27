use axum::extract::{Path, Query, State};
use axum::extract::rejection::PathRejection;
use axum::Json;
use axum_valid::Valid;
use serde::Deserialize;
use tower_sessions::Session;
use validator::Validate;

use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::auth::file::{MoveParams, RenameParams};
use crate::services::folder_service::FolderService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn get_folders(
    State(state): KosmosState,
    session: Session,
    folder_id: Result<Path<i64>, PathRejection>,
) -> Result<Json<serde_json::Value>, AppError> {
    let folder_id_result = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };

    let user_id = SessionService::check_logged_in(&session).await?;
    let folders = state
        .folder_service
        .get_folders(user_id, folder_id_result)
        .await?
        .into_iter()
        .map(FolderService::parse_folder)
        .collect::<Vec<_>>();

    let folder = if let Some(folder) = folder_id_result {
        Some(FolderService::parse_folder(
            state.folder_service.get_folder(folder).await?,
        ))
    } else {
        None
    };

    let structure = if let Some(folder) = folder_id_result {
        Some(state
            .folder_service
            .get_children_directories(folder, user_id)
            .await?
            .into_iter()
            .map(FolderService::parse_children_directory)
            .collect::<Vec<_>>()
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

pub async fn delete_folder(
    State(state): KosmosState,
    session: Session,
    Path(folder_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let user_is_allowed_to_delete_folder = state
        .folder_service
        .check_folder_exists_by_id(folder_id, user_id)
        .await?;

    if user_is_allowed_to_delete_folder.is_none() {
        return Err(AppError::NotFound {
            error: "Folder not found".to_string(),
        });
    }

    let is_empty = state
        .folder_service
        .check_folder_contains_elements(folder_id)
        .await?;

    if is_empty {
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
