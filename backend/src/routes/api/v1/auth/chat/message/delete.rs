use crate::model::chat::chat::DbChatModel;
use crate::model::internal::entity_id::EntityId;
use crate::model::internal::presence::index::{PresenceAction, PresenceMessage};
use crate::model::internal::presence::messages::{
    PresenceDeletedChatMessage,
};
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::{AppState, KosmosState};
use axum::extract::{Path, State};
use axum::Json;
use axum_jwt_auth::Claims;
use serde::Deserialize;
use crate::model::jwt::JwtClaims;
use crate::routes::api::v1::auth::chat::utils::notify_group_chat_members;

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
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(other_user_id): Path<i64>,
    Json(payload): Json<DeleteChatMessageDTO>,
) -> ResponseResult {

    let chat = state
        .contact_service
        .chat_service
        .get_personal_chat_optional(claims.user.user_id, other_user_id)
        .await?
        .ok_or_else(|| AppError::NotFound {
            error: "Chat not found".to_string(),
        })?;

    let message_id = payload.message_id.into();
    delete_message(&state, &chat, message_id, claims.user.user_id).await?;
    state.contact_service.chat_service.set_latest_message_at_now(chat.id).await?;

    // Personal chat, only one partner,  chat_id for other user is self user id
    let presence_message = PresenceMessage {
        action: PresenceAction::DeletedChatMessage(PresenceDeletedChatMessage {
            chat_id: claims.user.user_id.to_string(),
            message_id: message_id.to_string(),
        }),
        important: false
    };
    state
        .presence_handler
        .broadcast_to_user(other_user_id, presence_message)
        .await;

    Ok(AppSuccess::DELETED)
}

pub async fn delete_group_message(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(chat_id): Path<i64>,
    Json(payload): Json<DeleteChatMessageDTO>,
) -> ResponseResult {

    let chat = state
        .contact_service
        .chat_service
        .get_group_chat_optional_from_user(claims.user.user_id, chat_id)
        .await?
        .ok_or_else(|| AppError::NotFound {
            error: "Chat not found".to_string(),
        })?;

    let message_id = payload.message_id.into();
    delete_message(&state, &chat, message_id, claims.user.user_id).await?;
    state.contact_service.chat_service.set_latest_message_at_now(chat.id).await?;

    // Group chat, broadcast to all members
    let presence_message = PresenceMessage {
        action: PresenceAction::DeletedChatMessage(PresenceDeletedChatMessage {
            chat_id: chat_id.to_string(),
            message_id: message_id.to_string(),
        }),
        important: false
    };

    notify_group_chat_members(&state,chat.id, claims.user.user_id, presence_message).await?;

    Ok(AppSuccess::DELETED)
}
