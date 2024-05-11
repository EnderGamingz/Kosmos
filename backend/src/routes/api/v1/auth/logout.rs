use axum::http::StatusCode;
use axum::response::IntoResponse;
use tower_sessions::Session;

use crate::services::session_service::SessionService;

pub async fn logout(session: Session) -> impl IntoResponse {
    let session_exists = session.get::<String>("user_id").await.unwrap();

    if session_exists.is_none() {
        return StatusCode::NOT_MODIFIED.into_response();
    }

    SessionService::flush_session(&session).await;
    StatusCode::OK.into_response()
}
