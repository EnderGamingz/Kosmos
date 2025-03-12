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
pub struct CancelContactRequestDTO {
    pub id: EntityId,
}

pub async fn cancel_sent_contact_request(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<CancelContactRequestDTO>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let request = state
        .contact_service
        .get_request_by_id_optional(payload.id.into())
        .await?
        .ok_or(AppError::NotFound {
            error: "Contact request not found".to_string(),
        })?;

    if request.user_id != user_id {
        return Err(AppError::NotAllowed {
            error: "You are not allowed to cancel this request".to_string(),
        });
    }

    state
        .contact_service
        .delete_contact_request(request.id)
        .await?;

    Ok(AppSuccess::DELETED)
}

#[derive(Deserialize)]
pub struct DeleteContactLinkDTO {
    pub user_id: EntityId,
}

pub async fn delete_contact_link(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<DeleteContactLinkDTO>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    state
        .contact_service
        .delete_contact_link(user_id, payload.user_id.into())
        .await?;

    Ok(AppSuccess::DELETED)
}