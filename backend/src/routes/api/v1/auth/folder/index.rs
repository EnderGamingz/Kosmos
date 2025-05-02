use axum::extract::rejection::PathRejection;
use axum::extract::{Path, Query, State};
use axum::Json;
use axum_jwt_auth::Claims;
use axum_valid::Valid;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use validator::Validate;

use crate::model::folder::{FolderModelDTO, SimpleDirectoryDTO};
use crate::model::internal::entity_id::{EntityId, OptionEntityId};
use crate::model::internal::presence::index::{PresenceAction, PresenceMessage};
use crate::model::internal::presence::messages::PresenceExplorerUpdate;
use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::auth::file::{GetFilesSortParams, MoveParams, RenameParams};
use crate::state::KosmosState;

#[derive(Deserialize, Debug, PartialEq)]
pub enum SortByFolders {
    Name,
    CreatedAt,
    UpdatedAt,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct FolderResponse {
    folder: Option<FolderModelDTO>,
    folders: Vec<FolderModelDTO>,
    structure: Option<Vec<SimpleDirectoryDTO>>,
}

pub async fn get_folders(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Query(sort_params): Query<GetFilesSortParams<SortByFolders>>,
    folder_id: Result<Path<i64>, PathRejection>,
) -> Result<Json<FolderResponse>, AppError> {
    let parent = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };

    let folders: Vec<FolderModelDTO> = state
        .folder_service
        .get_folders(claims.user.user_id, parent, sort_params)
        .await?
        .into_iter()
        .map(FolderModelDTO::from)
        .collect::<Vec<_>>();

    let folder: Option<FolderModelDTO> = if let Some(folder) = parent {
        Some(FolderModelDTO::from(
            state.folder_service.get_folder(folder).await?,
        ))
    } else {
        None
    };

    let structure = if let Some(folder) = parent {
        Some(
            state
                .folder_service
                .get_parent_directories(folder, Some(claims.user.user_id), None)
                .await?
                .into_iter()
                .map(SimpleDirectoryDTO::from)
                .collect::<Vec<_>>(),
        )
    } else {
        None
    };

    Ok(Json(FolderResponse {
        folder,
        folders,
        structure,
    }))
}

#[derive(Deserialize, Validate)]
pub struct FolderRequest {
    #[validate(length(min = 1, message = "Name cannot be empty"))]
    name: String,
}

pub async fn create_folder(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    folder_id: Result<Path<i64>, PathRejection>,
    Valid(Json(payload)): Valid<Json<FolderRequest>>,
) -> ResponseResult {
    let folder_id = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };
    let does_folder_exist = state
        .folder_service
        .check_folder_exists_by_name(&payload.name, claims.user.user_id, folder_id)
        .await?;

    if does_folder_exist.is_some() {
        return Err(AppError::Forbidden {
            error: Some("Folder already exists".to_string()),
        });
    }

    let folder = state
        .folder_service
        .create_folder(claims.user.user_id, payload.name, folder_id)
        .await?
        .to_string();

    state
        .presence_handler
        .broadcast_to_user(
            claims.user.user_id,
            PresenceMessage {
                action: PresenceAction::ExplorerUpdate(PresenceExplorerUpdate {
                    folder_id: folder_id.map(|f| f.to_string()),
                }),
                important: false,
            },
        )
        .await;

    Ok(AppSuccess::CREATED { id: Some(folder) })
}

pub async fn move_folder(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(folder_id): Path<i64>,
    Query(params): Query<MoveParams>,
) -> ResponseResult {
    let folder = match state
        .folder_service
        .check_folder_exists_by_id(folder_id, claims.user.user_id)
        .await?
    {
        None => {
            return Err(AppError::NotFound {
                error: "Folder not found".to_string(),
            })
        }
        Some(folder) => folder,
    };

    if let Some(move_to_folder) = params.folder_id {
        if !state
            .folder_service
            .check_folder_exists_by_id(move_to_folder, claims.user.user_id)
            .await?
            .is_some()
        {
            return Err(AppError::NotFound {
                error: "Folder not found".to_string(),
            });
        }
    }

    let is_folder_already_in_destination = state
        .folder_service
        .check_folder_exists_in_folder(&folder.folder_name, params.folder_id)
        .await?;

    if is_folder_already_in_destination {
        return Err(AppError::DataConflict {
            error: "Folder already exists in destination folder".to_string(),
        });
    }

    state
        .folder_service
        .move_folder(claims.user.user_id, folder_id, params.folder_id)
        .await?;

    state
        .presence_handler
        .broadcast_to_user(
            claims.user.user_id,
            PresenceMessage {
                action: PresenceAction::ExplorerUpdate(PresenceExplorerUpdate { folder_id: None }),
                important: false,
            },
        )
        .await;

    Ok(AppSuccess::MOVED)
}

#[derive(Deserialize)]
pub struct MultiMovePayload {
    files: Vec<EntityId>,
    folders: Vec<EntityId>,
    target_folder: OptionEntityId,
}

pub async fn multi_move(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Json(payload): Json<MultiMovePayload>,
) -> ResponseResult {
    let file_ids = payload
        .files
        .into_iter()
        .map(|f| f.into())
        .collect::<Vec<i64>>();
    let folder_ids = payload
        .folders
        .into_iter()
        .map(|f| f.into())
        .collect::<Vec<i64>>();
    let target_folder_id = payload.target_folder.into();

    if let Some(target_folder_id) = target_folder_id {
        if folder_ids.contains(&target_folder_id) {
            return Err(AppError::BadRequest {
                error: Some("Target folder cannot be one of the source folders".to_string()),
            });
        };
    }

    state
        .folder_service
        .multi_move_items(
            claims.user.user_id,
            file_ids,
            folder_ids,
            target_folder_id,
            &state.file_service,
        )
        .await?;

    state
        .presence_handler
        .broadcast_to_user(
            claims.user.user_id,
            PresenceMessage {
                action: PresenceAction::ExplorerUpdate(PresenceExplorerUpdate {
                    folder_id: target_folder_id.map(|f| f.to_string()),
                }),
                important: false,
            },
        )
        .await;

    Ok(AppSuccess::MOVED)
}

pub async fn rename_folder(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(folder_id): Path<i64>,
    Valid(Json(payload)): Valid<Json<RenameParams>>,
) -> ResponseResult {
    let folder = state
        .folder_service
        .check_folder_exists_by_id(folder_id, claims.user.user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "Folder not found".to_string(),
        })?;

    state
        .folder_service
        .rename_folder(
            claims.user.user_id,
            folder_id,
            payload.name,
            folder.parent_id,
        )
        .await?;

    state
        .presence_handler
        .broadcast_to_user(
            claims.user.user_id,
            PresenceMessage {
                action: PresenceAction::ExplorerUpdate(PresenceExplorerUpdate {
                    folder_id: folder.parent_id.map(|f| f.to_string()),
                }),
                important: false,
            },
        )
        .await;

    Ok(AppSuccess::UPDATED)
}
