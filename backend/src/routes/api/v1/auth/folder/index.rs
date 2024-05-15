use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::folder_service::FolderService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::rejection::PathRejection;
use axum::extract::{Path, State};
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

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

    Ok(Json(serde_json::json!({
        "folder": folder,
        "folders": folders
    })))
}

#[derive(Deserialize)]
pub struct FolderRequest {
    name: String,
}

pub async fn create_folder(
    State(state): KosmosState,
    session: Session,
    folder_id: Result<Path<i64>, PathRejection>,
    Json(payload): Json<FolderRequest>,
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

    state.folder_service.delete_folder(folder_id).await?;

    Ok(AppSuccess::DELETED)
}
