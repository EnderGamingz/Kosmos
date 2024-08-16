use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

#[derive(Deserialize)]
pub struct UpdateFileContentPayload {
    pub content: String,
}

pub async fn update_file_contents(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
    Json(payload): Json<UpdateFileContentPayload>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let file = state.file_service.get_file(file_id, Some(user_id)).await?;

    if !file.is_valid_to_edit_content() {
        return Err(AppError::BadRequest {
            error: Some("File is not editable".to_string()),
        });
    }

    state
        .file_service
        .update_file_content(file_id, payload.content)
        .await?;

    Ok(AppSuccess::UPDATED)
}
