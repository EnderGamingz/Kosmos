use crate::model::jwt::JwtClaims;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum_jwt_auth::Claims;

pub async fn delete_notification_subscription(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(subscription_id): Path<i64>,
) -> ResponseResult {
    state
        .web_push_service
        .delete_subscription_by_user_id(claims.user.user_id, subscription_id)
        .await?;

    Ok(AppSuccess::DELETED)
}
