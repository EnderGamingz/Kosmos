use axum::extract::State;
use axum::Json;
use serde::Serialize;
use tower_sessions::Session;

use crate::response::error_handling::AppError;
use crate::services::session_service::{SessionService, UserId};
use crate::state::{AppState, KosmosState};

#[derive(Serialize)]
pub struct DiskUsage {
    pub active: i64,
    pub bin: i64,
    pub total: i64,
    pub limit: i64,
}

pub async fn get_disk_usage_by_id(
    state: &AppState,
    user_id: UserId,
) -> Result<DiskUsage, AppError> {
    let active_usage = state
        .user_service
        .get_user_storage_usage(user_id, Some(false))
        .await?;
    let bin_storage = state
        .user_service
        .get_user_storage_usage(user_id, Some(true))
        .await?;
    let total_usage = active_usage.clone() + bin_storage.clone();
    let storage_limit = state.user_service.get_user_storage_limit(user_id).await?;

    Ok(DiskUsage {
        active: active_usage,
        bin: bin_storage,
        total: total_usage,
        limit: storage_limit,
    })
}

pub async fn get_disk_usage(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<DiskUsage>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let usage = get_disk_usage_by_id(&state, user_id).await?;

    Ok(Json(usage))
}
