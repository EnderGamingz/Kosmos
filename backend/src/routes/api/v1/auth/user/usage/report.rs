use axum::extract::State;
use axum::Json;
use serde::Serialize;
use tower_sessions::Session;

use crate::model::file::FileModelDTO;
use crate::model::usage::{FileTypeSumDataDTO, UsageSumDataDTO};
use crate::response::error_handling::AppError;
use crate::services::session_service::{SessionService, UserId};
use crate::state::{AppState, KosmosState};

#[derive(Serialize)]
pub struct DiskUsageReport {
    active_storage: UsageSumDataDTO,
    bin_storage: UsageSumDataDTO,
    by_file_type: Vec<FileTypeSumDataDTO>,
    large_files: Vec<FileModelDTO>,
}

pub async fn get_usage_report_by_user_id(
    state: &AppState,
    user_id: UserId,
) -> Result<DiskUsageReport, AppError> {
    let active_storage = state
        .usage_service
        .get_user_storage_usage(user_id, Some(false))
        .await?
        .into();
    let bin_storage = state
        .usage_service
        .get_user_storage_usage(user_id, Some(true))
        .await?
        .into();

    let by_file_type = state
        .usage_service
        .get_file_type_stats(user_id, 10)
        .await?
        .into_iter()
        .map(FileTypeSumDataDTO::from)
        .collect();

    let large_files = state
        .usage_service
        .get_files_by_size(user_id, 15)
        .await?
        .into_iter()
        .map(FileModelDTO::from)
        .collect();

    Ok(DiskUsageReport {
        active_storage,
        bin_storage,
        by_file_type,
        large_files,
    })
}

pub async fn get_usage_report(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<DiskUsageReport>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let usage = get_usage_report_by_user_id(&state, user_id).await?;

    Ok(Json(usage))
}
