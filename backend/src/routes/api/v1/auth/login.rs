use axum::extract::State;
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;
use crate::constants::SESSION_USER_ID;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::services::user_service::UserService;
use crate::state::AppState;

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

    let result = state
        .user_service
        .get_user_by_username_optional(&payload.username)
        .await?;

    let user = match result {
        Some(user) => user,
        None => {
            return Err(AppError::Forbidden {
                error: Some("Invalid credentials".to_string()),
            });
        }
    };

    let is_password_valid =
        bcrypt::verify(payload.password, &*user.password_hash).map_err(|e| {
            tracing::error!("Failed to verify password: {}", e);
            AppError::InternalError
        })?;

    if !is_password_valid {
        Err(AppError::Forbidden {
            error: Some("Invalid credentials".to_string()),
        })?;
    }

    session.insert(SESSION_USER_ID, user.id).await.unwrap();

    Ok(Json(serde_json::json!(UserService::parse_user(user))))
}
