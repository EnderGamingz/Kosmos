use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use tower_sessions::Session;

pub async fn favorite_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let file = state
        .file_service
        .check_file_exists_by_id(file_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    state.file_service.set_favorite(file.id, !file.favorite).await?;

    Ok(AppSuccess::UPDATED)
}
