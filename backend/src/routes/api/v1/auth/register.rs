use axum::extract::State;
use axum::response::IntoResponse;
use axum::Json;

use crate::response::error_handling::AppError;
use crate::response::success_handling::AppSuccess;
use crate::services::user_service::RegisterCredentials;
use crate::state::KosmosState;

pub async fn register(
    State(state): KosmosState,
    Json(payload): Json<RegisterCredentials>,
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
            state.user_service.create_user(payload, hash).await?;
        }
        Err(e) => {
            tracing::error!("Error hashing password: {}", e);
            Err(AppError::InternalError)?
        }
    };

    Ok(AppSuccess::CREATED { id: None })
}
