use crate::model::passkey::PasskeyModelDTO;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use tower_sessions::Session;

pub async fn get_passkeys(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<Vec<PasskeyModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let passkeys = state
        .passkey_service
        .get_passkeys(user_id)
        .await?
        .into_iter()
        .map(PasskeyModelDTO::from)
        .collect();

    Ok(Json(passkeys))
}
