use tower_sessions::Session;

use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;

pub async fn logout(session: Session) -> ResponseResult {
    let session_exists = SessionService::get_user_id(&session).await;

    if session_exists.is_none() {
        return Err(AppError::NotLoggedIn);
    }

    SessionService::flush_session(&session).await;
    Ok(AppSuccess::OK { data: None })
}
