use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

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

    if from_user_id == to_user.id {
        return Err(AppError::BadRequest {
            error: Some("You can't send a contact request to yourself".to_string()),
        });
    }

    let are_contacts = state
        .contact_service
        .check_users_are_contacts(from_user_id, to_user.id)
        .await?;

    if are_contacts {
        return Err(AppError::BadRequest {
            error: Some("Users are already contacts".to_string()),
        });
    }

    let is_request_sent = state
        .contact_service
        .check_users_have_pending_request(from_user_id, to_user.id)
        .await?;

    if is_request_sent {
        return Err(AppError::BadRequest {
            error: Some("Contact request already sent".to_string()),
        });
    }

    state
        .contact_service
        .create_contact_request(from_user_id, to_user.id)
        .await?;

    Ok(AppSuccess::OK { data: None })
}
