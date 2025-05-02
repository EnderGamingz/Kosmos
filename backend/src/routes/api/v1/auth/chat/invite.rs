use crate::model::internal::entity_id::EntityId;
use crate::model::internal::presence::index::{PresenceAction, PresenceMessage};
use crate::model::internal::presence::messages::PresenceChatUpdate;
use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::auth::chat::utils::notify_group_chat_members;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use axum_jwt_auth::Claims;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct InviteToGroupDTO {
    pub user_id: EntityId,
}

pub async fn invite_user_to_group_chat(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(chat_id): Path<i64>,
    Json(payload): Json<InviteToGroupDTO>,
) -> ResponseResult {
    let chat = state
        .contact_service
        .chat_service
        .get_group_chat_optional_from_user(claims.user.user_id, chat_id)
        .await?
        .ok_or_else(|| AppError::NotFound {
            error: "Chat not found".to_string(),
        })?;

    let are_contacts = state
        .contact_service
        .check_users_are_contacts(claims.user.user_id, payload.user_id.into())
        .await?;

    if !are_contacts {
        return Err(AppError::BadRequest {
            error: Some("User is not a contact".to_string()),
        });
    }

    state
        .contact_service
        .chat_service
        .add_chat_member(chat.id, payload.user_id.into())
        .await?;

    let presence_message_to_members = PresenceMessage {
        action: PresenceAction::ChatUpdate(PresenceChatUpdate {
            chat_id: chat.id.to_string(),
        }),
        important: true,
    };
    notify_group_chat_members(
        &state,
        chat_id,
        payload.user_id.into(),
        presence_message_to_members,
    )
    .await?;

    let presence_message_to_new_member = PresenceMessage {
        action: PresenceAction::ChatsUpdate(),
        important: true,
    };
    state
        .presence_handler
        .broadcast_to_user(payload.user_id.into(), presence_message_to_new_member)
        .await;

    Ok(AppSuccess::UPDATED)
}
