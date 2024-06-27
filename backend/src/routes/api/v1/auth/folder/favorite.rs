use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use tower_sessions::Session;

pub async fn favorite_folder(
    State(state): KosmosState,
    session: Session,
    Path(folder_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let folder = state
        .folder_service
        .check_folder_exists_by_id(folder_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "Folder not found".to_string(),
        })?;

    state.folder_service.set_favorite(folder.id, !folder.favorite).await?;

    Ok(AppSuccess::UPDATED)
}
