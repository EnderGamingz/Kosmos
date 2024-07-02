use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

#[derive(Deserialize)]
pub struct UpdateShareRequest {
    password: Option<String>,
}

pub async fn update_share(
    State(state): KosmosState,
    session: Session,
    Path(share_id): Path<i64>,
    Json(payload): Json<UpdateShareRequest>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let share = state
        .share_service
        .get_share_for_user(share_id, user_id)
        .await?;

    if let Some(password) = payload.password {
        let hashed_password = bcrypt::hash(password, bcrypt::DEFAULT_COST).map_err(|e| {
            tracing::error!("Error hashing password: {}", e);
            AppError::InternalError
        })?;
        state
            .share_service
            .update_share_password(share.id, hashed_password)
            .await?;
    }

    Ok(AppSuccess::UPDATED)
}
