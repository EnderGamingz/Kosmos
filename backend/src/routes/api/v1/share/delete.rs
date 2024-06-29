use axum::extract::{Path, State};
use tower_sessions::Session;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn delete_share(
    State(state): KosmosState,
    session: Session,
    Path(share_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    state.share_service.delete_share(share_id, user_id).await?;
    Ok(AppSuccess::DELETED)
}