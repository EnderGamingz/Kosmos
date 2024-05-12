use axum::extract::State;
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn get_folders(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let folders = state.folder_service.get_folders(user_id, None).await?;

    Ok(Json(serde_json::json!(folders)))
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
        .await?;

    Ok(Json(serde_json::json!(folder)))
}