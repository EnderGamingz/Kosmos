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
) -> Result<Json<UserModelDTO>, AppError> {
    if let Some(user_id) = SessionService::get_user_id(&session).await {
        let auth_user = state.user_service.get_user(user_id).await?;

        match auth_user {
            None => {
                SessionService::flush_session(&session).await;

                Err(AppError::NotLoggedIn)?
            }
            Some(user) => {
                return Ok(Json(user.into()));
            }
        }
    };

    Err(AppError::NotLoggedIn)
}
