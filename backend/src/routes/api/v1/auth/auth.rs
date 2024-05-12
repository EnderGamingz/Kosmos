use axum::extract::State;
use axum::Json;
use tower_sessions::Session;

use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn auth(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<serde_json::Value>, AppError> {
    if let Some(user_id) = SessionService::get_user_id(&session).await {
        let result = state.user_service.get_auth_user(user_id).await?;

        return Ok(Json(serde_json::to_value(result).unwrap()));
    };
    Err(AppError::NotLoggedIn)
}
