use crate::constants::FALLBACK_STORAGE_LIMIT;
use axum::extract::State;
use axum::response::IntoResponse;
use axum::Json;
use axum_valid::Valid;
use crate::response::error_handling::AppError;
use crate::response::success_handling::AppSuccess;
use crate::services::user_service::RegisterCredentials;
use crate::state::KosmosState;

pub async fn register(
    State(state): KosmosState,
    Valid(Json(payload)): Valid<Json<RegisterCredentials>>,
) -> Result<impl IntoResponse, AppError> {
    let user_results = state
        .user_service
        .get_user_by_username_optional(&payload.username)
        .await?;

    if user_results.is_some() {
        return Err(AppError::BadRequest {
            error: Some("User already exists".to_string()),
        })?;
    }

    let password_hash = bcrypt::hash(&payload.password, 12);

    match password_hash {
        Ok(hash) => {

            let default_storage_limit = match std::env::var("DEFAULT_STORAGE_LIMIT") {
                Ok(env) => env.parse::<i64>().unwrap_or(FALLBACK_STORAGE_LIMIT),
                Err(_) => FALLBACK_STORAGE_LIMIT,
            };

            state
                .user_service
                .create_user(payload, hash, default_storage_limit)
                .await?;
        }
        Err(e) => {
            tracing::error!("Error hashing password: {}", e);
            Err(AppError::InternalError)?
        }
    };

    Ok(AppSuccess::CREATED { id: None })
}
