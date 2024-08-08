use crate::constants::SESSION_USER_ID_KEY;
use crate::model::user::UserModelDTO;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use tower_sessions::Session;
use webauthn_rs::prelude::{DiscoverableKey, PublicKeyCredential, RequestChallengeResponse};

pub async fn authentication_start(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<RequestChallengeResponse>, AppError> {
    SessionService::clear_passkey_authentication(&session).await;

    let challenge_response = match state
        .passkey_service
        .webauthn
        .start_discoverable_authentication()
    {
        Ok((rcr, auth_state)) => {
            SessionService::set_passkey_authentication(&session, auth_state).await;
            rcr
        }
        Err(e) => {
            tracing::error!("Failed to start passkey authentication: {}", e);
            return Err(AppError::InternalError);
        }
    };

    Ok(Json(challenge_response))
}

pub async fn authentication_complete(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<PublicKeyCredential>,
) -> Result<Json<UserModelDTO>, AppError> {
    let auth_state = SessionService::get_passkey_authentication(&session).await?;

    SessionService::clear_passkey_authentication(&session).await;

    let (_, discovered_credential_id) = state
        .passkey_service
        .webauthn
        .identify_discoverable_authentication(&payload)
        .map_err(|e| AppError::BadRequest {
            error: Some(e.to_string()),
        })?;

    let passkey = state
        .passkey_service
        .get_passkey_by_credential_id(discovered_credential_id)
        .await?;

    let discoverable_key = DiscoverableKey::from(passkey);

    let auth_result = match state
        .passkey_service
        .webauthn
        .finish_discoverable_authentication(&payload, auth_state, &[discoverable_key])
    {
        Ok(auth_result) => auth_result,
        Err(e) => {
            tracing::error!("Failed to finish passkey authentication: {}", e);
            return Err(AppError::BadRequest {
                error: Some(e.to_string()),
            });
        }
    };

    let user = state
        .user_service
        .get_user_from_passkey_credential_id(auth_result.cred_id())
        .await?;

    session
        .insert(SESSION_USER_ID_KEY, user.id)
        .await
        .map_err(|e| {
            tracing::error!("Failed to insert session by passkey auth: {}", e);
            AppError::InternalError
        })?;

    Ok(Json(user.into()))
}
