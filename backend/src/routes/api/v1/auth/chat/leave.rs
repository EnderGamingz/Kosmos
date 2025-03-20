use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use tower_sessions::Session;

pub async fn leave_group_chat(
    State(state): KosmosState,
    session: Session,
    Path(chat_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    state
        .contact_service
        .chat_service
        .get_group_chat_optional_from_user(user_id, chat_id)
        .await?
        .ok_or_else(|| AppError::NotFound {
            error: "Chat not found".to_string(),
        })?;

    state
        .contact_service
        .chat_service
        .remove_user_from_chat(user_id, chat_id)
        .await?;

    Ok(AppSuccess::OK { data: None })
}
