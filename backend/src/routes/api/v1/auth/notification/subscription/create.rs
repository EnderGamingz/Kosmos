use crate::model::jwt::JwtClaims;
use crate::model::push::PushSubscriptionModelDTO;
use crate::response::error_handling::AppError;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;
use serde::Deserialize;
use ts_rs::TS;

#[derive(Deserialize, TS)]
#[ts(export)]
pub struct CreateNotificationSubscriptionRequest {
    pub name: String,
    pub endpoint: String,
    pub p256dh: String,
    pub auth: String,
}

pub async fn create_notification_subscription(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Json(payload): Json<CreateNotificationSubscriptionRequest>,
) -> Result<Json<PushSubscriptionModelDTO>, AppError> {
    let subscription = state
        .web_push_service
        .create_subscription(
            claims.user.user_id,
            payload.endpoint,
            payload.p256dh,
            payload.auth,
            payload.name,
        )
        .await?;

    Ok(Json(subscription.into()))
}
