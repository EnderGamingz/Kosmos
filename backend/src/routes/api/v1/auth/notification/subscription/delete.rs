use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use tower_sessions::Session;

pub async fn delete_notification_subscription(
    State(state): KosmosState,
    session: Session,
    Path(subscription_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    state
        .web_push_service
        .delete_subscription_by_user_id(user_id, subscription_id)
        .await?;

    Ok(AppSuccess::DELETED)
}       
