use crate::model::jwt::JwtClaims;
use crate::model::push::PushSubscriptionModelDTO;
use crate::response::error_handling::AppError;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;

pub async fn get_notification_subscriptions(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
) -> Result<Json<Vec<PushSubscriptionModelDTO>>, AppError> {
    let subscriptions = state
        .web_push_service
        .get_user_subscriptions(claims.user.user_id)
        .await?;

    let subscriptions = subscriptions
        .into_iter()
        .map(PushSubscriptionModelDTO::from)
        .collect();

    Ok(Json(subscriptions))
}
