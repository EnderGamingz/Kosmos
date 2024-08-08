use axum::extract::{Path, State};
use tower_sessions::Session;

use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn delete_passkey(
    State(state): KosmosState,
    session: Session,
    Path(passkey_id): Path<i32>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    state
        .passkey_service
        .delete_passkey(user_id, passkey_id)
        .await?;

    Ok(AppSuccess::DELETED)
}
