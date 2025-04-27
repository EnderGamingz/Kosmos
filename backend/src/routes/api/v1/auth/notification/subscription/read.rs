use crate::model::push::PushSubscriptionModelDTO;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use tower_sessions::Session;

pub async fn get_notification_subscriptions(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<Vec<PushSubscriptionModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let subscriptions = state
        .web_push_service
        .get_user_subscriptions(user_id)
        .await?;
    
    let subscriptions = subscriptions
        .into_iter()
        .map(PushSubscriptionModelDTO::from)
        .collect();

    Ok(Json(subscriptions))
}
