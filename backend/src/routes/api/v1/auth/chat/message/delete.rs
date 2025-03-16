use crate::model::chat::chat::DbChatModel;
use crate::model::internal::entity_id::EntityId;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::{AppState, KosmosState};
use axum::extract::{Path, State};
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

async fn delete_message(
    state: &AppState,
    chat: &DbChatModel,
    message_id: i64,
    user_id: i64,
) -> Result<(), AppError> {
    let is_valid_message = state
        .contact_service
        .chat_service
        .check_message_id_exists_in_chat_by_user_id(message_id, chat.id, user_id)
        .await?;

    if !is_valid_message {
        return Err(AppError::BadRequest {
            error: Some("Invalid message ID".to_string()),
        });
    }

    state
        .contact_service
        .chat_service
        .delete_message(message_id)
        .await?;

    Ok(())
}

#[derive(Deserialize)]
pub struct DeleteChatMessageDTO {
    pub message_id: EntityId,
}

pub async fn delete_personal_message(
    State(state): KosmosState,
    session: Session,
    Path(other_user_id): Path<i64>,
    Json(payload): Json<DeleteChatMessageDTO>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let chat = state
        .contact_service
        .chat_service
        .get_personal_chat_optional(user_id, other_user_id)
        .await?
        .ok_or_else(|| AppError::NotFound {
            error: "Chat not found".to_string(),
        })?;

    delete_message(&state, &chat, payload.message_id.into(), user_id).await?;

    Ok(AppSuccess::DELETED)
}
