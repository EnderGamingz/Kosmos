use crate::model::internal::contact_request_status::ContactRequestStatus;
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
pub struct UpdateReceivedContactRequestDTO {
    pub id: EntityId,
    pub accept: bool,
}

pub async fn update_received_contact_request(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Json(payload): Json<UpdateReceivedContactRequestDTO>,
) -> ResponseResult {

    let request = state
        .contact_service
        .get_request_by_id_optional(payload.id.into())
        .await?
        .ok_or(AppError::NotFound {
            error: "Contact request not found".to_string(),
        })?;

    if request.status != ContactRequestStatus::Pending {
        return Err(AppError::BadRequest {
            error: Some("Contact request already handled".to_string()),
        });
    }

    if request.request_user_id != claims.user.user_id {
        return Err(AppError::NotFound {
            error: "Contact request not found".to_string(),
        });
    }

    let new_state = match payload.accept {
        true => ContactRequestStatus::Accepted,
        false => ContactRequestStatus::Declined,
    };

    // If the request is accepted, create a contact between the users
    if new_state == ContactRequestStatus::Accepted {
        state
            .contact_service
            .create_contact_link(request.user_id, request.request_user_id)
            .await?;
    }

    state
        .contact_service
        .update_contact_request_to_user(payload.id.into(), claims.user.user_id, new_state)
        .await?;

    notify_attention_status_for_user(&state, request.request_user_id).await?;

    let presence_message_to_new_member = PresenceMessage{
        action: PresenceAction::ChatsUpdate(),
        important: true,
    };
    state.presence_handler.broadcast_to_user(request.user_id, presence_message_to_new_member.clone()).await;
    state.presence_handler.broadcast_to_user(request.request_user_id, presence_message_to_new_member).await;

    Ok(AppSuccess::UPDATED)
}
