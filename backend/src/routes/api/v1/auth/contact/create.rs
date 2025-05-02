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
pub struct ContactRequestDTO {
    pub username: String,
}

pub async fn send_contact_request(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Json(payload): Json<ContactRequestDTO>,
) -> ResponseResult {
    let to_user = state
        .user_service
        .get_user_by_username_optional(&payload.username)
        .await?
        .ok_or(AppError::UserNotFound)?;

    if claims.user.user_id == to_user.id {
        return Err(AppError::BadRequest {
            error: Some("You can't send a contact request to yourself".to_string()),
        });
    }

    let are_contacts = state
        .contact_service
        .check_users_are_contacts(claims.user.user_id, to_user.id)
        .await?;

    if are_contacts {
        return Err(AppError::BadRequest {
            error: Some("Users are already contacts".to_string()),
        });
    }

    let is_request_sent = state
        .contact_service
        .check_users_have_pending_request(claims.user.user_id, to_user.id)
        .await?;

    if is_request_sent {
        return Err(AppError::BadRequest {
            error: Some("Contact request already sent".to_string()),
        });
    }

    state
        .contact_service
        .create_contact_request(claims.user.user_id, to_user.id)
        .await?;

    notify_attention_status_for_user(&state, to_user.id).await?;

    Ok(AppSuccess::OK { data: None })
}
