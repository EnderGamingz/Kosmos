use crate::model::internal::entity_id::EntityId;
use crate::model::internal::presence::index::{PresenceAction, PresenceMessage};
use crate::model::internal::presence::messages::PresenceExplorerUpdate;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

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

    state
        .file_service
        .mark_file_for_deletion(file_id, user_id)
        .await?;

    state
        .presence_handler
        .broadcast_to_user(
            user_id,
            PresenceMessage {
                action: PresenceAction::ExplorerUpdate(PresenceExplorerUpdate {
                    folder_id: file.parent_folder_id.map(|f| f.to_string()),
                }),
                important: false,
            },
        )
        .await;

    Ok(AppSuccess::UPDATED)
}

#[derive(Deserialize)]
pub struct MarkFilesForDeletion {
    pub files: Vec<EntityId>,
}

pub async fn mark_files_for_deletion(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<MarkFilesForDeletion>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let file_ids: Vec<i64> = payload.files.into_iter().map(|f| f.into()).collect();

    state
        .file_service
        .mark_files_for_deletion(file_ids, user_id)
        .await?;

    state
        .presence_handler
        .broadcast_to_user(
            user_id,
            PresenceMessage {
                action: PresenceAction::ExplorerUpdate(PresenceExplorerUpdate { folder_id: None }),
                important: false,
            },
        )
        .await;

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

    state
        .presence_handler
        .broadcast_to_user(
            user_id,
            PresenceMessage {
                action: PresenceAction::ExplorerUpdate(PresenceExplorerUpdate {
                    folder_id: file.parent_folder_id.map(|f| f.to_string()),
                }),
                important: false,
            },
        )
        .await;

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
        .permanently_delete_file(file.id, Some(file.file_type))
        .await?;

    state
        .presence_handler
        .broadcast_to_user(
            user_id,
            PresenceMessage {
                action: PresenceAction::ExplorerUpdate(PresenceExplorerUpdate {
                    folder_id: file.parent_folder_id.map(|f| f.to_string()),
                }),
                important: false,
            },
        )
        .await;

    Ok(AppSuccess::DELETED)
}

pub async fn clear_bin(State(state): KosmosState, session: Session) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    state.file_service.clear_bin(user_id).await?;
    Ok(AppSuccess::OK { data: None })
}
