use axum::extract::State;
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

use crate::constants::SESSION_USER_ID_KEY;
use crate::model::user::UserModelDTO;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::AppState;
use crate::utils::auth;
#[derive(Deserialize)]
pub struct LoginCredentials {
    username: String,
    password: String,
}

pub async fn login(
    State(state): State<AppState>,
    session: Session,
    Json(payload): Json<LoginCredentials>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::get_user_id(&session).await;
    if user_id.is_some() {
        return Ok(Json(serde_json::json!({})));
    }

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

    session
        .insert(SESSION_USER_ID_KEY, user.id)
        .await
        .map_err(|e| {
            tracing::error!("Failed to insert session: {}", e);
            AppError::InternalError
        })?;

    let user_dto: UserModelDTO = user.into();

    Ok(Json(serde_json::json!(user_dto)))
}
