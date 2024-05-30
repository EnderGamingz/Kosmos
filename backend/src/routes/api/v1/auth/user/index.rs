use axum::extract::State;
use axum::Json;
use tower_sessions::Session;

use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn get_disk_usage(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let active_usage = state.user_service.get_user_storage_usage(user_id, false).await?;
    let bin_storage = state.user_service.get_user_storage_usage(user_id, true).await?;

    Ok(Json(serde_json::json!({
        "active": active_usage.to_string(),
        "bin": bin_storage.to_string(),
    })))
}