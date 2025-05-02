use crate::model::jwt::JwtClaims;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum_jwt_auth::Claims;

pub async fn delete_passkey(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(passkey_id): Path<i32>,
) -> ResponseResult {
    state
        .passkey_service
        .delete_passkey(claims.user.user_id, passkey_id)
        .await?;

    Ok(AppSuccess::DELETED)
}
