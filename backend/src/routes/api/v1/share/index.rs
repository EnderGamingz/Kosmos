use axum::extract::{Path, State};
use axum::Json;
use serde::Serialize;
use tower_sessions::Session;

use crate::model::file::{FileModel, ShareFileModelDTO};
use crate::model::folder::{FolderModel, ShareFolderModelDTO, SimpleDirectoryDTO};
use crate::model::share::{ExtendedShareModel, ExtendedShareModelDTO};
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::{AppState, KosmosState};
use crate::utils::auth;

pub async fn get_file_shares_for_user(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> Result<Json<Vec<ExtendedShareModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let shares = state
        .share_service
        .get_file_shares(file_id, user_id)
        .await?
        .into_iter()
        .map(ExtendedShareModelDTO::from)
        .collect::<Vec<_>>();

    Ok(Json(shares))
}

pub async fn get_folder_shares_for_user(
    State(state): KosmosState,
    session: Session,
    Path(folder_id): Path<i64>,
) -> Result<Json<Vec<ExtendedShareModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let shares = state
        .share_service
        .get_folder_shares(folder_id, user_id)
        .await?
        .into_iter()
        .map(ExtendedShareModelDTO::from)
        .collect::<Vec<_>>();

    Ok(Json(shares))
}

#[derive(serde::Deserialize)]
pub struct UnlockShareRequest {
    share_uuid: String,
    password: String,
}

pub async fn unlock_share(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<UnlockShareRequest>,
) -> ResponseResult {
    let share = state.share_service.get_share(&payload.share_uuid).await?;

    //Check password
    match share.password {
        Some(password) => {
            let is_correct = auth::verify_password(payload.password.as_str(), password.as_str())?;

            if !is_correct {
                Err(AppError::BadRequest {
                    error: Some("Wrong password".to_string()),
                })?;
            }

            SessionService::grant_share_access(&session, &share.uuid.to_string()).await;
        }
        None => {
            Err(AppError::BadRequest {
                error: Some("Share is not password protected".to_string()),
            })?;
        }
    }

    Ok(AppSuccess::OK { data: None })
}

pub async fn access_file_share(
    State(state): KosmosState,
    session: Session,
    Path(share_uuid): Path<String>,
) -> Result<Json<ShareFileModelDTO>, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid, false).await?;

    let file = get_share_file(&state, share.file_id).await?;
    let _ = state.share_service.handle_share_access(share.id).await;

    Ok(Json(file.share_file))
}

#[derive(Serialize)]
pub struct FolderShareData {
    folder: ShareFolderModelDTO,
    folders: Vec<ShareFolderModelDTO>,
    files: Vec<ShareFileModelDTO>,
    structure: Vec<SimpleDirectoryDTO>,
}

pub async fn access_folder_share(
    State(state): KosmosState,
    session: Session,
    Path(share_uuid): Path<String>,
) -> Result<Json<FolderShareData>, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid, false).await?;

    let folder = get_share_folder_data(&state, share.folder_id).await?;
    let _ = state.share_service.handle_share_access(share.id).await;

    let structure = state
        .folder_service
        .get_parent_directories(share.folder_id.unwrap(), None, share.folder_id)
        .await?
        .into_iter()
        .map(SimpleDirectoryDTO::from)
        .collect::<Vec<_>>();

    Ok(Json(FolderShareData {
        folder: folder.share_folder,
        folders: folder.folders,
        files: folder.files,
        structure,
    }))
}

#[derive(serde::Deserialize, PartialEq)]
pub enum AccessShareItemType {
    File,
    Folder,
}

pub async fn access_folder_share_item(
    State(state): KosmosState,
    session: Session,
    Path((share_uuid, access_type, access_id)): Path<(String, AccessShareItemType, i64)>,
) -> Result<Json<serde_json::Value>, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid, true).await?;

    let can_access_with_share =
        get_share_access_for_folder_items(&state, &access_type, access_id, &share).await?;

    if !can_access_with_share {
        Err(AppError::NotAllowed {
            error: "Not allowed".to_string(),
        })?;
    }

    return match access_type {
        AccessShareItemType::File => {
            let file = get_share_file(&state, Some(access_id)).await?;
            Ok(Json(serde_json::json!(file.share_file)))
        }
        AccessShareItemType::Folder => {
            let folder = get_share_folder_data(&state, Some(access_id)).await?;
            let structure = state
                .folder_service
                .get_parent_directories(access_id, None, share.folder_id)
                .await?
                .into_iter()
                .map(SimpleDirectoryDTO::from)
                .collect::<Vec<_>>();

            Ok(Json(serde_json::json!({
                "folder": folder.share_folder,
                "folders": folder.folders,
                "files": folder.files,
                "structure": structure
            })))
        }
    };
}

pub async fn get_share_access_for_folder_items(
    state: &AppState,
    access_type: &AccessShareItemType,
    access_id: i64,
    share: &ExtendedShareModel,
) -> Result<bool, AppError> {
    let can_access_with_share = match access_type {
        AccessShareItemType::File => {
            let file = state.file_service.get_file(access_id, None).await?;
            if let Some(parent_folder_id) = file.parent_folder_id {
                state
                    .share_service
                    .is_folder_existing_under_share(
                        parent_folder_id,
                        share.id,
                        &state.folder_service,
                    )
                    .await?
            } else {
                false
            }
        }
        AccessShareItemType::Folder => {
            state
                .share_service
                .is_folder_existing_under_share(access_id, share.id, &state.folder_service)
                .await?
        }
    };

    Ok(can_access_with_share)
}

pub async fn is_allowed_to_access_share(
    state: &AppState,
    session: &Session,
    share_uuid: String,
    count_as_use: bool,
) -> Result<ExtendedShareModel, AppError> {
    let logged_in_user = state.user_service.check_user_optional(&session).await?;
    let share = state.share_service.get_share(&share_uuid).await?;

    //Check expired
    if let Some(expiry) = share.expires_at {
        if expiry < chrono::Utc::now() {
            Err(AppError::Gone {
                error: "Share expired".to_string(),
            })?;
        }
    }

    // Check access limit
    if let Some(uses) = share.access_limit {
        if uses < 1 {
            Err(AppError::Gone {
                error: "Access limit reached".to_string(),
            })?;
        }
    }

    // Check private share
    if let Some(target) = share.share_target {
        match logged_in_user {
            None => Err(AppError::NotLoggedIn)?,
            Some(user) => {
                if user.id != target {
                    Err(AppError::NotAllowed {
                        error: "Not allowed".to_string(),
                    })?;
                }
            }
        }
    }

    //Check password
    if share.password.is_some() {
        if !SessionService::check_share_access(&session, &share.uuid.to_string()).await {
            Err(AppError::Locked {
                error: "Password protected".to_string(),
            })?;
        }
    }

    if count_as_use {
        reduce_access_limit(state, &share).await?;
    }

    Ok(share)
}

pub struct SharedFileData {
    pub file: FileModel,
    pub share_file: ShareFileModelDTO,
}

pub async fn get_share_file(
    state: &AppState,
    file_id: Option<i64>,
) -> Result<SharedFileData, AppError> {
    let file = match file_id {
        None => Err(AppError::NotFound {
            error: "File not found".to_string(),
        })?,
        Some(file_id) => state.file_service.get_file(file_id, None).await?,
    };

    let share_file: ShareFileModelDTO = file.clone().into();

    Ok(SharedFileData { file, share_file })
}

pub struct SharedFolder {
    pub folder: FolderModel,
    pub share_folder: ShareFolderModelDTO,
}

pub async fn get_share_folder(
    state: &AppState,
    folder_id: Option<i64>,
) -> Result<SharedFolder, AppError> {
    let folder = match folder_id {
        None => Err(AppError::NotFound {
            error: "Folder not found".to_string(),
        })?,
        Some(folder_id) => state.folder_service.get_folder(folder_id).await?,
    };

    let share_folder = folder.clone().into();

    Ok(SharedFolder {
        folder,
        share_folder,
    })
}

pub struct SharedFolderData {
    share_folder: ShareFolderModelDTO,
    folders: Vec<ShareFolderModelDTO>,
    files: Vec<ShareFileModelDTO>,
}

pub async fn get_share_folder_data(
    state: &AppState,
    folder_id: Option<i64>,
) -> Result<SharedFolderData, AppError> {
    let data = get_share_folder(state, folder_id).await?;

    let folders = state
        .folder_service
        .get_folders_for_share(&Some(data.folder.id))
        .await?
        .into_iter()
        .map(ShareFolderModelDTO::from)
        .collect::<Vec<_>>();

    let files: Vec<ShareFileModelDTO> = state
        .file_service
        .get_files_for_share(Some(data.folder.id))
        .await?
        .into_iter()
        .map(ShareFileModelDTO::from)
        .collect::<Vec<_>>();

    Ok(SharedFolderData {
        share_folder: data.share_folder,
        folders,
        files,
    })
}

pub async fn reduce_access_limit(
    state: &AppState,
    share: &ExtendedShareModel,
) -> Result<(), AppError> {
    if let Some(uses) = share.access_limit {
        state
            .share_service
            .update_access_limit(&share.id, uses - 1)
            .await?;
    };
    Ok(())
}
