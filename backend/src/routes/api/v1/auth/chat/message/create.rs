use crate::model::chat::author::{ChatAuthorModelDTO, DbChatAuthorModel};
use crate::model::chat::message::ChatMessageModelDTO;
use crate::model::internal::entity_id::EntityId;
use crate::model::internal::presence::index::{PresenceAction, PresenceMessage};
use crate::model::internal::presence::messages::PresenceNewChatMessage;
use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::chat::utils::notify_group_chat_members;
use crate::state::{AppState, KosmosState};
use axum::extract::{Path, State};
use axum::Json;
use axum_jwt_auth::Claims;
use axum_valid::Valid;
use serde::Deserialize;
use serde_trim::string_trim;
use validator::Validate;

pub async fn resolve_message_dependencies(
    state: &AppState,
    user_id: i64,
    chat_id: i64,
    parent_id: Option<i64>,
) -> Result<(Option<ChatMessageModelDTO>, ChatAuthorModelDTO), AppError> {
    let mut author_cache: Option<DbChatAuthorModel> = None;

    let parent = if let Some(parent_id) = parent_id.map(|id| id.into()) {
        let is_valid_message = state
            .contact_service
            .chat_service
            .check_message_id_exists_in_chat(parent_id, chat_id)
            .await?;

        if !is_valid_message {
            Err(AppError::BadRequest {
                error: Some("Invalid parent message ID".to_string()),
            })?;
        }

        let parent = state
            .contact_service
            .chat_service
            .get_message_by_id(parent_id)
            .await?;

        let author = state
            .contact_service
            .chat_service
            .get_author_by_user_id(parent.user_id)
            .await?;

        if parent.user_id == user_id {
            author_cache = Some(author.clone());
        }

        Some(parent.to_dto(Some(author.into()), None))
    } else {
        None
    };

    let author: ChatAuthorModelDTO = if let Some(author) = author_cache {
        author.into()
    } else {
        let author = state
            .contact_service
            .chat_service
            .get_author_by_user_id(user_id)
            .await?;

        author.into()
    };
    Ok((parent, author))
}

async fn send_message(
    state: &AppState,
    user_id: i64,
    chat_id: i64,
    payload: &CreateChatMessageDTO,
) -> Result<ChatMessageModelDTO, AppError> {
    let (parent, author) = resolve_message_dependencies(
        state,
        user_id,
        chat_id,
        payload.parent_id.map(|id| id.into()),
    )
    .await?;

    let message = state
        .contact_service
        .chat_service
        .create_message(user_id, chat_id, &payload)
        .await?;

    state
        .contact_service
        .chat_service
        .set_latest_message_at_now(chat_id)
        .await?;

    Ok(message.to_dto(Some(author), parent))
}

#[derive(Deserialize, Validate)]
pub struct CreateChatMessageDTO {
    #[validate(length(min = 1, max = 16384))]
    #[serde(deserialize_with = "string_trim")]
    pub content: String,
    pub parent_id: Option<EntityId>,
}

pub async fn send_personal_message(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(other_user_id): Path<i64>,
    Valid(Json(payload)): Valid<Json<CreateChatMessageDTO>>,
) -> Result<Json<ChatMessageModelDTO>, AppError> {
    let chat = state
        .contact_service
        .chat_service
        .get_personal_chat_optional(claims.user.user_id, other_user_id)
        .await?
        .ok_or_else(|| AppError::NotFound {
            error: "Chat not found".to_string(),
        })?;

    let message = send_message(&state, claims.user.user_id, chat.id, &payload).await?;

    // Personal chat, only one partner, chat_id for other user is self user id
    let presence_message = PresenceMessage {
        action: PresenceAction::NewChatMessage(PresenceNewChatMessage {
            chat_id: claims.user.user_id.to_string(),
            chat_type: chat.chat_type,
            content: message.clone(),
        }),
        important: true,
    };
    state
        .presence_handler
        .broadcast_to_user(other_user_id, presence_message)
        .await;

    Ok(Json(message))
}

pub async fn send_group_message(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(chat_id): Path<i64>,
    Valid(Json(payload)): Valid<Json<CreateChatMessageDTO>>,
) -> Result<Json<ChatMessageModelDTO>, AppError> {
    let chat = state
        .contact_service
        .chat_service
        .get_group_chat_optional_from_user(claims.user.user_id, chat_id)
        .await?
        .ok_or_else(|| AppError::NotFound {
            error: "Chat not found".to_string(),
        })?;

    let message = send_message(&state, claims.user.user_id, chat.id, &payload).await?;

    // Group chat, broadcast to all members
    let presence_message = PresenceMessage {
        action: PresenceAction::NewChatMessage(PresenceNewChatMessage {
            chat_id: chat_id.to_string(),
            chat_type: chat.chat_type,
            content: message.clone(),
        }),
        important: true,
    };
    notify_group_chat_members(&state, chat.id, claims.user.user_id, presence_message).await?;

    Ok(Json(message))
}
