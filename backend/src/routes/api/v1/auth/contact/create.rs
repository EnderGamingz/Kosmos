use axum::extract::State;
use tower_sessions::Session;
use axum::Json;
use serde::Deserialize;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

#[derive(Deserialize)]
pub struct ContactRequestDTO {
    pub username: String,
}

pub async fn send_contact_request(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<ContactRequestDTO>,
) -> ResponseResult {
    let from_user_id = SessionService::check_logged_in(&session).await?;

    let to_user = state
        .user_service
        .get_user_by_username_optional(&payload.username)
        .await?
        .ok_or(AppError::UserNotFound)?;

    state
        .contact_service
        .create_contact_request(from_user_id, to_user.id)
        .await?;

    Ok(AppSuccess::OK { data: None })
}