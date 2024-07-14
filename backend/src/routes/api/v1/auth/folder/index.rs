use crate::model::folder::{FolderModelDTO, SimpleDirectoryDTO};
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::auth::file::{
    GetFilesParsedSortParams, GetFilesSortParams, MoveParams, RenameParams, SortOrder,
};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::rejection::PathRejection;
use axum::extract::{Path, Query, State};
use axum::Json;
use axum_valid::Valid;
use serde::{Deserialize, Serialize};
use tower_sessions::Session;
use validator::Validate;

#[derive(Deserialize, Debug, PartialEq)]
pub enum SortByFolders {
    Name,
    CreatedAt,
    UpdatedAt,
}

#[derive(Serialize)]
pub struct FolderResponse {
    folder: Option<FolderModelDTO>,
    folders: Vec<FolderModelDTO>,
    structure: Option<Vec<SimpleDirectoryDTO>>,
}

pub async fn get_folders(
    State(state): KosmosState,
    session: Session,
    Query(sort_params): Query<GetFilesSortParams<SortByFolders>>,
    folder_id: Result<Path<i64>, PathRejection>,
) -> Result<Json<FolderResponse>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let parent = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };

    let parsed_params = GetFilesParsedSortParams {
        sort_order: sort_params.sort_order.unwrap_or(SortOrder::Asc),
        sort_by: sort_params.sort_by.unwrap_or(SortByFolders::Name),
        limit: sort_params.limit.unwrap_or(200),
        offset: sort_params.offset.unwrap_or(0),
    };

    let folders: Vec<FolderModelDTO> = state
        .folder_service
        .get_folders(user_id, parent, parsed_params)
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
                .get_parent_directories(folder, Some(user_id), None)
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
    State(state): KosmosState,
    session: Session,
    folder_id: Result<Path<i64>, PathRejection>,
    Valid(Json(payload)): Valid<Json<FolderRequest>>,
) -> ResponseResult {
    let folder_id = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };
    let user_id = SessionService::check_logged_in(&session).await?;
    let does_folder_exist = state
        .folder_service
        .check_folder_exists_by_name(&payload.name, user_id, folder_id)
        .await?;

    if does_folder_exist.is_some() {
        return Err(AppError::Forbidden {
            error: Some("Folder already exists".to_string()),
        });
    }

    let folder = state
        .folder_service
        .create_folder(user_id, payload.name, folder_id)
        .await?
        .to_string();

    Ok(AppSuccess::CREATED { id: Some(folder) })
}

pub async fn move_folder(
    State(state): KosmosState,
    session: Session,
    Path(folder_id): Path<i64>,
    params: Option<Query<MoveParams>>,
) -> ResponseResult {
    let move_to_folder = params.map(|params| params.folder_id);

    let user_id = SessionService::check_logged_in(&session).await?;

    let folder = match state
        .folder_service
        .check_folder_exists_by_id(folder_id, user_id)
        .await?
    {
        None => {
            return Err(AppError::NotFound {
                error: "Folder not found".to_string(),
            })
        }
        Some(folder) => folder,
    };

    if let Some(move_to_folder) = move_to_folder {
        if !state
            .folder_service
            .check_folder_exists_by_id(move_to_folder, user_id)
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
        .check_folder_exists_in_folder(&folder.folder_name, move_to_folder)
        .await?;

    if is_folder_already_in_destination {
        return Err(AppError::DataConflict {
            error: "Folder already exists in destination folder".to_string(),
        });
    }

    state
        .folder_service
        .move_folder(user_id, folder_id, move_to_folder)
        .await?;

    Ok(AppSuccess::MOVED)
}

pub async fn rename_folder(
    State(state): KosmosState,
    session: Session,
    Path(folder_id): Path<i64>,
    Valid(Json(payload)): Valid<Json<RenameParams>>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let folder = state
        .folder_service
        .check_folder_exists_by_id(folder_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "Folder not found".to_string(),
        })?;

    state
        .folder_service
        .rename_folder(user_id, folder_id, payload.name, folder.parent_id)
        .await?;

    Ok(AppSuccess::UPDATED)
}
