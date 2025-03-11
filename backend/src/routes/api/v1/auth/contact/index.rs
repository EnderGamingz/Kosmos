use crate::model::contact::ContactRequestModelDTO;
use crate::model::profile::{ProfileContactModelDTO};
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use serde::Serialize;
use tower_sessions::Session;

#[derive(Serialize)]
pub struct ContactRequestsResponse {
    pub requests_send: Vec<ContactRequestModelDTO>,
    pub requests_received: Vec<ContactRequestModelDTO>,
}

pub async fn get_unhandled_contact_requests(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<ContactRequestsResponse>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let requests_send = state
        .contact_service
        .get_send_requests(user_id)
        .await?
        .into_iter()
        .map(|r| r.into())
        .collect();

    let requests_received = state
        .contact_service
        .get_received_requests(user_id)
        .await?
        .into_iter()
        .map(|r| r.into())
        .collect();

    Ok(Json(ContactRequestsResponse {
        requests_send,
        requests_received,
    }))
}

pub async fn get_requires_attention(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<bool>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let requires_attention = state
        .contact_service
        .does_require_attention(user_id)
        .await?;

    Ok(Json(requires_attention))
}

pub async fn get_contacts_profiles(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<Vec<ProfileContactModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let profiles = state
        .contact_service
        .get_contacts_profiles(user_id)
        .await?
        .into_iter()
        .map(|c| c.into())
        .collect();

    Ok(Json(profiles))
}
