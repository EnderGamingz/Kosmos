use axum::extract::State;
use axum::response::IntoResponse;
use axum::Json;
use axum_valid::Valid;

use crate::constants::FALLBACK_STORAGE_LIMIT;
use crate::response::error_handling::AppError;
use crate::response::success_handling::AppSuccess;
use crate::services::user_service::RegisterCredentials;
use crate::state::KosmosState;
use crate::utils::auth;

pub async fn register(
    State(state): KosmosState,
    Valid(Json(payload)): Valid<Json<RegisterCredentials>>,
) -> Result<impl IntoResponse, AppError> {
    let is_register_enabled =
        std::env::var("ALLOW_REGISTER").unwrap_or("false".to_string()) == "true";

    if !is_register_enabled {
        return Err(AppError::BadRequest {
            error: Some("Registration is not allowed".to_string()),
        })?;
    }

    let user_results = state
        .user_service
        .get_user_by_username_optional(&payload.username)
        .await?;

    if user_results.is_some() {
        return Err(AppError::BadRequest {
            error: Some("User already exists".to_string()),
        })?;
    }

    let password_hash = auth::hash_password(&payload.password)?;

    let default_storage_limit = match std::env::var("DEFAULT_STORAGE_LIMIT") {
        Ok(env) => env.parse::<i64>().unwrap_or(FALLBACK_STORAGE_LIMIT),
        Err(_) => FALLBACK_STORAGE_LIMIT,
    };

    let id = state
        .user_service
        .create_user(payload.username, password_hash, default_storage_limit)
        .await?;

    Ok(AppSuccess::CREATED { id: Some(id.to_string()) })
}
