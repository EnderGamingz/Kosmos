use crate::model::jwt::JwtClaims;
use crate::model::passkey::PasskeyModelDTO;
use crate::response::error_handling::AppError;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;

pub async fn get_passkeys(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
) -> Result<Json<Vec<PasskeyModelDTO>>, AppError> {
    let passkeys = state
        .passkey_service
        .get_passkeys(claims.user.user_id)
        .await?
        .into_iter()
        .map(PasskeyModelDTO::from)
        .collect();

    Ok(Json(passkeys))
}
