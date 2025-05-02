use crate::model::internal::entity_id::EntityId;
use crate::model::internal::presence::index::{PresenceAction, PresenceMessage};
use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::auth::contact::index::notify_attention_status_for_user;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct CancelContactRequestDTO {
    pub id: EntityId,
}

pub async fn cancel_sent_contact_request(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Json(payload): Json<CancelContactRequestDTO>,
) -> ResponseResult {
    let request = state
        .contact_service
        .get_request_by_id_optional(payload.id.into())
        .await?
        .ok_or(AppError::NotFound {
            error: "Contact request not found".to_string(),
        })?;

    if request.user_id != claims.user.user_id {
        return Err(AppError::NotAllowed {
            error: "You are not allowed to cancel this request".to_string(),
        });
    }

    state
        .contact_service
        .delete_contact_request(request.id)
        .await?;

    notify_attention_status_for_user(&state, request.request_user_id).await?;

    Ok(AppSuccess::DELETED)
}

#[derive(Deserialize)]
pub struct DeleteContactLinkDTO {
    pub user_id: EntityId,
}

pub async fn delete_contact_link(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Json(payload): Json<DeleteContactLinkDTO>,
) -> ResponseResult {
    state
        .contact_service
        .delete_contact_link(claims.user.user_id, payload.user_id.into())
        .await?;

    let presence_message_to_new_member = PresenceMessage {
        action: PresenceAction::ChatsUpdate(),
        important: false,
    };
    state
        .presence_handler
        .broadcast_to_user(payload.user_id.into(), presence_message_to_new_member)
        .await;

    Ok(AppSuccess::DELETED)
}
