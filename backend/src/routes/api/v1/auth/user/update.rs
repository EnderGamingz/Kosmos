use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::services::user_service::{UpdateUserRequest, UserService};
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use axum_valid::Valid;
use serde::Deserialize;
use tower_sessions::Session;
use validator::Validate;

fn remove_whitespace(s: &str) -> String {
    s.chars().filter(|c| !c.is_whitespace()).collect()
}

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
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let user = state.user_service.get_auth_user(user_id).await?;

    let mut user_update = UpdateUserRequest {
        username: user.username.clone(),
        email: None,
        full_name: None,
    };

    if let Some(username) = payload.username {
        let username = remove_whitespace(&username);
        if username != user.username {
            if username.len() < 4 || username.len() > 255 {
                return Err(AppError::BadRequest {
                    error: Some("Username too short".to_string()),
                });
            }
            let exists = state
                .user_service
                .get_user_by_username_optional(&username)
                .await?;
            if exists.is_some() {
                return Err(AppError::DataConflict {
                    error: "Username already in use".to_string(),
                });
            }
            user_update.username = username;
        }
    }

    if let Some(email) = payload.email {
        user_update.email = Some(remove_whitespace(&email));
    }
    if let Some(full_name) = payload.full_name {
        user_update.full_name = Some(full_name);
    }

    let updated_user =
        UserService::parse_user(state.user_service.update_user(user_id, user_update).await?);

    Ok(Json(serde_json::json!(updated_user)))
}

#[derive(Deserialize)]
pub struct PasswordUpdatePayload {
    pub old_password: String,
    pub new_password: String,
}

pub async fn update_user_password(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<PasswordUpdatePayload>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let user = state.user_service.get_auth_user(user_id).await?;

    let password_flag = bcrypt::verify(payload.old_password, &user.password_hash).map_err(|e| {
        tracing::error!("Error while verifying password: {}", e);
        AppError::InternalError
    })?;

    if !password_flag {
        return Err(AppError::Forbidden {
            error: Some("Wrong password provided".to_string()),
        });
    }

    let hash = bcrypt::hash(payload.new_password, bcrypt::DEFAULT_COST).map_err(|e| {
        tracing::error!("Error while hashing password: {}", e);
        AppError::InternalError
    })?;

    state
        .user_service
        .update_user_password(user_id, hash)
        .await?;

    Ok(AppSuccess::UPDATED)
}
