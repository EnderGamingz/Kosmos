use crate::model::internal::presence::index::{PresenceAction, PresenceMessage};
use crate::model::internal::presence::messages::PresenceChatUpdate;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::auth::chat::utils::notify_group_chat_members;
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

    let remaining_members = state
        .contact_service
        .chat_service
        .get_chat_member_count(chat_id)
        .await?;

    if remaining_members == 0 {
        state
            .contact_service
            .chat_service
            .delete_chat(chat_id)
            .await?;
    }

    let presence_message = PresenceMessage {
        action: PresenceAction::ChatUpdate(PresenceChatUpdate {
            chat_id: chat_id.to_string(),
        }),
        important: true,
    };
    notify_group_chat_members(&state, chat_id, user_id.into(), presence_message).await?;

    Ok(AppSuccess::OK { data: None })
}
