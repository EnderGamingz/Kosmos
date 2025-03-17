use crate::model::chat::message::ChatMessageModelDTO;
use crate::model::internal::entity_id::EntityId;
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::chat::message::create::resolve_message_dependencies;
use crate::services::session_service::SessionService;
use crate::state::{AppState, KosmosState};
use axum::extract::{Path, State};
use axum::Json;
use axum_valid::Valid;
use serde::Deserialize;
use serde_trim::string_trim;
use tower_sessions::Session;
use validator::Validate;
use crate::model::internal::presence::index::{PresenceAction, PresenceMessage};
use crate::model::internal::presence::messages::{PresenceUpdatedChatMessage};

async fn update_message(
    state: &AppState,
    user_id: i64,
    chat_id: i64,
    message_id: i64,
    payload: &UpdateChatMessageDTO,
) -> Result<ChatMessageModelDTO, AppError> {
    let is_valid_message = state
        .contact_service
        .chat_service
        .check_message_id_exists_in_chat_by_user_id(message_id, chat_id, user_id)
        .await?;

    if !is_valid_message {
        return Err(AppError::BadRequest {
            error: Some("Invalid message ID".to_string()),
        });
    }

    let updated_message = state
        .contact_service
        .chat_service
        .update_message(message_id, payload.content.clone())
        .await?;

    let (parent, author) =
        resolve_message_dependencies(state, user_id, chat_id, updated_message.parent_id).await?;

    let updated_message = updated_message.to_dto(Some(author.into()), parent);

    Ok(updated_message)
}

#[derive(Deserialize, Validate)]
pub struct UpdateChatMessageDTO {
    #[validate(length(min = 1, max = 16384))]
    #[serde(deserialize_with = "string_trim")]
    pub content: String,
    pub message_id: EntityId,
}

pub async fn update_personal_message(
    State(state): KosmosState,
    session: Session,
    Path(other_user_id): Path<i64>,
    Valid(Json(payload)): Valid<Json<UpdateChatMessageDTO>>,
) -> Result<Json<ChatMessageModelDTO>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let chat = state
        .contact_service
        .chat_service
        .get_personal_chat_optional(user_id, other_user_id)
        .await?
        .ok_or_else(|| AppError::NotFound {
            error: "Chat not found".to_string(),
        })?;

    let message_id = payload.message_id.into();

    let message = update_message(
        &state,
        user_id,
        chat.id,
        message_id,
        &payload,
    )
    .await?;

    // Personal chat, only one partner, chat_id for other user is self user id
    let presence_message = PresenceMessage {
        action: PresenceAction::UpdatedChatMessage(PresenceUpdatedChatMessage {
            chat_id: user_id.to_string(),
            message_id: message_id.to_string(),
            content: message.clone(),
        }),
    };
    state
        .presence_handler
        .broadcast_to_user(other_user_id, presence_message)
        .await;

    Ok(Json(message))
}
