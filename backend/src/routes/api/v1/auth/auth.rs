use axum::extract::State;
use axum::Json;
use tower_sessions::Session;

use crate::model::user::UserModelDTO;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn auth(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<serde_json::Value>, AppError> {
    if let Some(user_id) = SessionService::get_user_id(&session).await {
        let auth_user = state.user_service.get_auth_user(user_id).await?;
        let user_dto: UserModelDTO = auth_user.into();

        return Ok(Json(serde_json::json!(user_dto)));
    };

    Err(AppError::NotLoggedIn)
}
