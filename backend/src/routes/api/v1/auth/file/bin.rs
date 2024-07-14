use axum::extract::{Path, State};
use tower_sessions::Session;
use crate::model::file::FileType;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn mark_file_for_deletion(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let file = state
        .file_service
        .check_file_exists_by_id(file_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    if file.deleted_at.is_some() {
        return Err(AppError::DataConflict {
            error: "File already in bin".to_string(),
        });
    };

    state.file_service.mark_file_for_deletion(file_id).await?;

    Ok(AppSuccess::UPDATED)
}

pub async fn restore_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let file = state
        .file_service
        .check_file_exists_by_id(file_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    if file.deleted_at.is_none() {
        return Err(AppError::DataConflict {
            error: "File is not in bin".to_string(),
        });
    };

    state.file_service.restore_file(file_id).await?;

    Ok(AppSuccess::UPDATED)
}

pub async fn permanently_delete_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let file = state
        .file_service
        .check_file_exists_by_id(file_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    /* Disabled so permanent delete action is possible
    if file.deleted_at.is_none() {
        return Err(AppError::BadRequest {
            error: Some("File is not marked as deleted".to_string()),
        });
    }
    */

    state
        .file_service
        .permanently_delete_file(file.id, Some(FileType::by_id(file.file_type)))
        .await?;

    Ok(AppSuccess::DELETED)
}

pub async fn clear_bin(State(state): KosmosState, session: Session) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    state.file_service.clear_bin(user_id).await?;
    Ok(AppSuccess::OK { data: None })
}