use crate::model::jwt::JwtClaims;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum_jwt_auth::Claims;

pub async fn delete_share(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(share_id): Path<i64>,
) -> ResponseResult {
    state
        .share_service
        .delete_share(share_id, claims.user.user_id)
        .await?;
    Ok(AppSuccess::DELETED)
}
