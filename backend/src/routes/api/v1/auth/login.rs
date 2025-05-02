use crate::model::user::UserModelDTO;
use crate::response::error_handling::AppError;
use crate::services::jwt_service::JwtService;
use crate::state::AppState;
use crate::utils::auth;
use axum::extract::State;
use axum::Json;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Deserialize)]
pub struct LoginCredentials {
    username: String,
    password: String,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct LoginResponseDTO {
    token: String,
    user: UserModelDTO,
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginCredentials>,
) -> Result<Json<LoginResponseDTO>, AppError> {
    let found_user = state
        .user_service
        .get_user_by_username_optional(&payload.username)
        .await?;

    let user = match found_user {
        Some(user) => user,
        None => {
            return Err(AppError::Forbidden {
                error: Some("Invalid credentials".to_string()),
            });
        }
    };

    let is_password_valid = auth::verify_password(payload.password.as_str(), &user.password_hash)?;

    if !is_password_valid {
        Err(AppError::Forbidden {
            error: Some("Invalid credentials".to_string()),
        })?;
    }

    let has_profile = state.profile_service.check_profile_exists(user.id).await?;
    if !has_profile {
        state.profile_service.create_empty_profile(user.id).await?;
    }

    let result = JwtService::login_user(user.clone()).map_err(|_| AppError::InternalError)?;

    Ok(Json(LoginResponseDTO {
        token: result,
        user: user.into(),
    }))
}
