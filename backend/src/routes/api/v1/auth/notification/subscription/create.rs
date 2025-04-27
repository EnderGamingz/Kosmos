use axum::extract::State;
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;
use ts_rs::TS;
use crate::model::push::PushSubscriptionModelDTO;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

#[derive(Deserialize, TS)]
#[ts(export)]
pub struct CreateNotificationSubscriptionRequest {
    pub name: String,
    pub endpoint: String,
    pub p256dh: String,
    pub auth: String,
}

pub async fn create_notification_subscription(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<CreateNotificationSubscriptionRequest>,
) -> Result<Json<PushSubscriptionModelDTO>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let subscription = state
        .web_push_service
        .create_subscription(user_id, payload.endpoint, payload.p256dh, payload.auth, payload.name)
        .await?;

    Ok(Json(subscription.into()))
}
