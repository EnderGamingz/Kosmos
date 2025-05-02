use crate::model::jwt::JwtClaims;
use crate::model::user::UserModelDTO;
use crate::response::error_handling::AppError;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;

pub async fn auth(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
) -> Result<Json<UserModelDTO>, AppError> {
    let auth_user = state.user_service.get_user(claims.user.user_id).await?;

    match auth_user {
        None => Err(AppError::NotLoggedIn)?,
        Some(user) => {
            return Ok(Json(user.into()));
        }
    }

    Err(AppError::NotLoggedIn)
}
