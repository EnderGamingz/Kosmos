use crate::response::error_handling::AppError;
use crate::services::folder_service::FolderService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::extract::rejection::PathRejection;
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
        Some(FolderService::parse_folder(state.folder_service.get_folder(folder).await?))
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
    Json(payload): Json<FolderRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let does_folder_exist = state
        .folder_service
        .check_folder_exists_by_name(&payload.name, user_id, None)
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
