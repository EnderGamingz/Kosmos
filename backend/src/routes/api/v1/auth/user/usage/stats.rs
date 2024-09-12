use serde::Serialize;
use axum::extract::State;
use tower_sessions::Session;
use axum::Json;
use ts_rs::TS;
use crate::response::error_handling::AppError;
use crate::services::session_service::{SessionService, UserId};
use crate::state::{AppState, KosmosState};

#[derive(Serialize,TS)]
#[ts(export)]
pub struct DiskUsageStats {
    #[ts(type = "number")]
    pub active: i64,
    #[ts(type = "number")]
    pub bin: i64,
    #[ts(type = "number")]
    pub total: i64,
    #[ts(type = "number")]
    pub limit: i64,
}

pub async fn get_usage_stats_by_user_id(
    state: &AppState,
    user_id: UserId,
) -> Result<DiskUsageStats, AppError> {
    let active_usage = state
        .usage_service
        .get_user_storage_usage(user_id, Some(false))
        .await?.get_sum();
    let bin_storage = state
        .usage_service
        .get_user_storage_usage(user_id, Some(true))
        .await?.get_sum();
    let total_usage = active_usage.clone() + bin_storage.clone();
    let storage_limit = state.user_service.get_user_storage_limit(user_id).await?;

    Ok(DiskUsageStats {
        active: active_usage,
        bin: bin_storage,
        total: total_usage,
        limit: storage_limit,
    })
}

pub async fn get_usage_stats(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<DiskUsageStats>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let usage = get_usage_stats_by_user_id(&state, user_id).await?;

    Ok(Json(usage))
}