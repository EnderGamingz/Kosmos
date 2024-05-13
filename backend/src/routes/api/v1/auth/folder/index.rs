use crate::response::error_handling::AppError;
use crate::services::folder_service::FolderService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

pub async fn get_folders(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let folders = state
        .folder_service
        .get_folders(user_id, None)
        .await?
        .into_iter()
        .map(FolderService::parse_folder)
        .collect::<Vec<_>>();

    Ok(Json(serde_json::json!({
        "folder": None::<i64>,
        "folders": folders
    })))
}

pub async fn get_folders_from_parent(
    State(state): KosmosState,
    session: Session,
    Path(folder_id): Path<i64>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let folders = state
        .folder_service
        .get_folders(user_id, Some(folder_id))
        .await?
        .into_iter()
        .map(|folder| FolderService::parse_folder(folder))
        .collect::<Vec<_>>();

    let folder = FolderService::parse_folder(state.folder_service.get_folder(folder_id).await?);

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
    Json(payload): Json<FolderRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let does_folder_exist = state
        .folder_service
        .check_folder_exists(&payload.name, user_id, None)
        .await?;

    if does_folder_exist.is_some() {
        return Err(AppError::Forbidden {
            error: Some("Folder already exists".to_string()),
        });
    }

    let folder = state
        .folder_service
        .create_folder(user_id, payload.name, None)
        .await?
        .to_string();

    Ok(Json(serde_json::json!(folder)))
}
