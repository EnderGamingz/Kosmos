use axum::extract::State;
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;
use webauthn_rs::prelude::{CreationChallengeResponse, RegisterPublicKeyCredential};

use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

#[derive(Deserialize)]
pub struct PasskeyRegisterStart {
    pub name: String,
}

pub async fn register_start(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<PasskeyRegisterStart>,
) -> Result<Json<CreationChallengeResponse>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let user = state.user_service.get_auth_user(user_id).await?;

    let excluded_credentials = state
        .passkey_service
        .get_excluded_credentials(user_id)
        .await?;

    let excluded_credentials = match excluded_credentials.len() > 0 {
        true => Some(excluded_credentials),
        false => None,
    };

    let username = user.username.clone();
    let full_name = user.full_name.clone().unwrap_or(user.username);

    let challenge_response = match state.passkey_service.webauthn.start_passkey_registration(
        user.uuid,
        username.as_str(),
        full_name.as_str(),
        excluded_credentials,
    ) {
        Ok((ccr, reg_state)) => {
            SessionService::set_passkey_register(&session, reg_state, payload.name).await;
            ccr
        }
        Err(e) => {
            tracing::error!("Failed to start passkey registration: {}", e);
            return Err(AppError::InternalError);
        }
    };

    Ok(Json(challenge_response))
}

pub async fn register_complete(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<RegisterPublicKeyCredential>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let (register_state, register_name) = SessionService::get_passkey_register(&session).await?;

    SessionService::clear_passkey_register(&session).await;

    let passkey = match state
        .passkey_service
        .webauthn
        .finish_passkey_registration(&payload, &register_state)
    {
        Ok(passkey) => passkey,
        Err(e) => {
            tracing::error!("Failed to finish passkey registration: {}", e);
            return Err(AppError::InternalError);
        }
    };

    state
        .passkey_service
        .create_passkey(user_id, passkey, register_name)
        .await?;

    Ok(AppSuccess::CREATED { id: None })
}
