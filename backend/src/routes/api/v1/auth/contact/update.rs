use crate::model::internal::contact_request_status::ContactRequestStatus;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;
use crate::model::internal::entity_id::EntityId;

#[derive(Deserialize)]
pub struct UpdateReceivedContactRequestDTO {
    pub id: EntityId,
    pub accept: bool,
}

pub async fn update_received_contact_request(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<UpdateReceivedContactRequestDTO>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

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

    if request.request_user_id != user_id {
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
        .update_contact_request_to_user(payload.id.into(), user_id, new_state)
        .await?;

    Ok(AppSuccess::UPDATED)
}
