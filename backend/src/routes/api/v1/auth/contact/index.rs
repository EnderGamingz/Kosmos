use crate::model::profile::{ProfileContactModelDTO, ProfileContactPendingModelDTO};
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{State, Query};
use axum::Json;
use axum_valid::Valid;
use serde::{Deserialize, Serialize};
use tower_sessions::Session;
use ts_rs::TS;
use validator::Validate;

#[derive(Serialize, TS)]
#[ts(export)]
pub struct ContactRequestsResponse {
    pub requests_sent: Vec<ProfileContactPendingModelDTO>,
    pub requests_received: Vec<ProfileContactPendingModelDTO>,
}

pub async fn get_unhandled_contact_requests(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<ContactRequestsResponse>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let requests_sent = state
        .contact_service
        .get_sent_requests_profiles(user_id)
        .await?
        .into_iter()
        .map(|r| r.into())
        .collect();

    let requests_received = state
        .contact_service
        .get_received_requests_profiles(user_id)
        .await?
        .into_iter()
        .map(|r| r.into())
        .collect();

    Ok(Json(ContactRequestsResponse {
        requests_sent,
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
        .has_unhandled_requests(user_id)
        .await?;

    Ok(Json(requires_attention))
}

#[derive(Deserialize, Validate, Debug)]
pub struct GetContactProfilesParamsDTO {
    #[serde(default = "get_default_limit")]
    #[validate(range(min = 1, max = 500))]
    pub limit: i64,

    #[serde(default = "get_default_page")]
    #[validate(range(min = 0))]
    pub page: i64,

    pub query: Option<String>,
}

fn get_default_limit() -> i64 {
    20
}

fn get_default_page() -> i64 {
    0
}

pub async fn get_contacts_profiles(
    State(state): KosmosState,
    session: Session,
    Valid(Query(query)): Valid<Query<GetContactProfilesParamsDTO>>
) -> Result<Json<Vec<ProfileContactModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let profiles = state
        .contact_service
        .get_contacts_profiles_by_search(user_id, query)
        .await?
        .into_iter()
        .map(|c| c.into())
        .collect();

    Ok(Json(profiles))
}