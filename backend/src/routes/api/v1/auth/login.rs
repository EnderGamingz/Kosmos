use axum::extract::State;
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
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
) -> ResponseResult {
    let user_id = SessionService::get_user_id(&session).await;
    if user_id.is_some() {
        return Ok(AppSuccess::OK { data: None });
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

    println!("user: {:?}", user);

    let is_password_valid = bcrypt::verify(payload.password, &*user.password_hash)
        .map_err(|_| AppError::InternalError)?;

    if !is_password_valid {
        return Err(AppError::Forbidden {
            error: Some("Invalid credentials".to_string()),
        });
    }

    session
        .insert("user_id", user.id)
        .await
        .unwrap();

    Ok(AppSuccess::OK {
        data: Some(serde_json::to_string(&user).unwrap()),
    })
}
