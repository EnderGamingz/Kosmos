use crate::model::user::UserModelDTO;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::services::user_service::UpdateUserRequest;
use crate::state::KosmosState;
use crate::utils::{auth, string, validation};
use axum::extract::State;
use axum::Json;
use axum_valid::Valid;
use serde::Deserialize;
use tower_sessions::Session;
use validator::Validate;

#[derive(Deserialize, Validate)]
pub struct UpdateUserPayload {
    pub username: Option<String>,
    pub email: Option<String>,
    pub full_name: Option<String>,
}

pub async fn update_user(
    State(state): KosmosState,
    session: Session,
    Valid(Json(payload)): Valid<Json<UpdateUserPayload>>,
) -> Result<Json<UserModelDTO>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let user = state.user_service.get_auth_user(user_id).await?;

    let mut user_update = UpdateUserRequest {
        username: user.username.clone(),
        email: None,
        full_name: None,
    };

    if let Some(username) = payload.username {
        let username = validation::verify_username(username.as_str())?;
        if username != user.username {
            let exists = state
                .user_service
                .get_user_by_username_optional(&username)
                .await?;
            if exists.is_some() {
                return Err(AppError::DataConflict {
                    error: "Username already in use".to_string(),
                });
            }
        }
        user_update.username = username;
    }

    if let Some(email) = payload.email {
        user_update.email = Some(string::remove_whitespace(&email));
    }
    if let Some(full_name) = payload.full_name {
        user_update.full_name = Some(full_name);
    }

    let updated_user = state.user_service.update_user(user_id, user_update).await?;

    Ok(Json(updated_user.into()))
}

#[derive(Deserialize, Validate)]
pub struct PasswordUpdatePayload {
    pub old_password: String,
    pub new_password: String,
}

pub async fn update_user_password(
    State(state): KosmosState,
    session: Session,
    Valid(Json(payload)): Valid<Json<PasswordUpdatePayload>>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let user = state.user_service.get_auth_user(user_id).await?;

    validation::validate_password(&payload.new_password)?;

    // Make sure old password is not the same as new password
    if payload.new_password == payload.old_password {
        return Err(AppError::BadRequest {
            error: Some("New password cannot be the same as old password".to_string()),
        });
    }

    // Make sure old password is correct
    let password_flag = auth::verify_password(&payload.old_password, &user.password_hash)?;

    if !password_flag {
        return Err(AppError::BadRequest {
            error: Some("Old password is not correct".to_string()),
        });
    }

    // Hash new password
    let new_password_hash = auth::hash_password(&payload.new_password)?;

    // Update password
    state
        .user_service
        .update_user_password(user_id, new_password_hash)
        .await?;

    Ok(AppSuccess::UPDATED)
}
