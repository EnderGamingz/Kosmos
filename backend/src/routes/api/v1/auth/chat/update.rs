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
pub struct RenameGroupDTO {
    pub name: String,
}

pub async fn rename_group_chat(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(chat_id): Path<i64>,
    Json(payload): Json<RenameGroupDTO>,
) -> ResponseResult {
    let chat = state
        .contact_service
        .chat_service
        .get_group_chat_optional_from_user(claims.user.user_id, chat_id)
        .await?
        .ok_or_else(|| AppError::NotFound {
            error: "Chat not found".to_string(),
        })?;

    state
        .contact_service
        .chat_service
        .rename_group_chat(chat.id, payload.name)
        .await?;

    let presence_message = PresenceMessage {
        action: PresenceAction::ChatUpdate(PresenceChatUpdate {
            chat_id: chat_id.to_string(),
        }),
        important: false,
    };
    notify_group_chat_members(
        &state,
        chat_id,
        claims.user.user_id.into(),
        presence_message,
    )
    .await?;

    Ok(AppSuccess::UPDATED)
}
