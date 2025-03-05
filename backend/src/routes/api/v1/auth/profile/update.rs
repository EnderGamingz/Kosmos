use axum::extract::State;
use tower_sessions::Session;
use axum::Json;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::profile_service::UpdateProfileDTO;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn update_profile(
    State(state): KosmosState,
    session: Session,
    Json(profile): Json<UpdateProfileDTO>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    state
        .profile_service
        .update_profile(user_id.into(), &profile)
        .await?;

    Ok(AppSuccess::UPDATED)
}