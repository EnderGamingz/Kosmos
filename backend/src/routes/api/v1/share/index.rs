use crate::model::file::{FileModel, ParsedShareFileModel};
use crate::model::folder::{ParsedShareFolderModel};
use crate::model::share::ShareModel;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::file_service::FileService;
use crate::services::folder_service::FolderService;
use crate::services::session_service::SessionService;
use crate::services::share_service::ShareService;
use crate::state::{AppState, KosmosState};
use axum::extract::{Path, State};
use axum::Json;
use tower_sessions::Session;

pub async fn get_file_shares_for_user(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let shares = state
        .share_service
        .get_file_shares(file_id, user_id)
        .await?;

    let shares = shares
        .into_iter()
        .map(|share| ShareService::parse_share(share))
        .collect::<Vec<_>>();

    Ok(Json(serde_json::json!(shares)))
}



pub async fn get_folder_shares_for_user(
    State(state): KosmosState,
    session: Session,
    Path(folder_id): Path<i64>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let shares = state
        .share_service
        .get_folder_shares(folder_id, user_id)
        .await?;

    let shares = shares
        .into_iter()
        .map(|share| ShareService::parse_share(share))
        .collect::<Vec<_>>();

    Ok(Json(serde_json::json!(shares)))
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
    if let Some(password) = share.password {
        let is_correct = bcrypt::verify(payload.password, &password).map_err(|e| {
            tracing::error!("Error verifying share password: {}", e);
            AppError::BadRequest {
                error: Some("Wrong password".to_string()),
            }
        })?;

        if !is_correct {
            return Err(AppError::BadRequest {
                error: Some("Wrong password".to_string()),
            })?;
        } else {
            SessionService::grant_share_access(&session, &share.uuid).await;
        }
    } else {
        return Err(AppError::BadRequest {
            error: Some("Share is not password protected".to_string()),
        })?;
    }

    Ok(AppSuccess::OK { data: None })
}

pub async fn access_file_share(
    State(state): KosmosState,
    session: Session,
    Path(share_uuid): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid, false).await?;

    let file = get_share_file(&state, share.file_id).await?;
    let _ = state.share_service.handle_share_access(share.id).await;

    Ok(Json(serde_json::json!(file.share_file)))
}

pub async fn access_folder_share(
    State(state): KosmosState,
    session: Session,
    Path(share_uuid): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid, false).await?;

    let folder = get_share_folder(&state, share.folder_id).await?;
    let _ = state.share_service.handle_share_access(share.id).await;

    Ok(Json(serde_json::json!({
                "folder": folder.share_folder,
                "folders": folder.folders,
                "files": folder.files
            })))
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

    let can_access_with_share = get_share_access_for_folder_items(&state, &access_type, access_id, share).await?;

    if !can_access_with_share {
        return Err(AppError::NotAllowed {
            error: "Not allowed".to_string(),
        })?;
    }

    return match access_type {
        AccessShareItemType::File => {
            let file = get_share_file(&state, Some(access_id)).await?;
            Ok(Json(serde_json::json!(file.share_file)))
        }
        AccessShareItemType::Folder => {
            let folder =
                get_share_folder(&state, Some(access_id)).await?;
            Ok(Json(serde_json::json!({
                "folder": folder.share_folder,
                "folders": folder.folders,
                "files": folder.files
            })))
        }
    };
}

pub async fn get_share_access_for_folder_items(state: &AppState, access_type: &AccessShareItemType, access_id: i64, share: ShareModel) -> Result<bool, AppError> {
    let can_access_with_share = match access_type {
        AccessShareItemType::File => {
            let file = state.file_service.get_file(access_id).await?;
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
) -> Result<ShareModel, AppError> {
    let logged_in_user = state.user_service.check_user_optional(&session).await?;
    let share = state.share_service.get_share(&share_uuid).await?;

    // Check private share
    if let Some(target) = share.share_target {
        match logged_in_user {
            None => Err(AppError::NotAllowed {
                error: "Not logged in".to_string(),
            })?,
            Some(user) => {
                if user.id != target {
                    return Err(AppError::NotAllowed {
                        error: "Not allowed".to_string(),
                    })?;
                }
            }
        }
    }

    // Check access limit
    if let Some(uses) = share.access_limit {
        if uses < 1 {
            return Err(AppError::NotAllowed {
                error: "Access limit reached".to_string(),
            })?;
        }
    }

    //Check password
    if share.password.is_some() {
        if !SessionService::check_share_access(&session, &share.uuid).await {
            return Err(AppError::NotAllowed {
                error: "Password protected".to_string(),
            })?;
        }
    }

    //Check expired
    if let Some(expiry) = share.expires_at {
        if expiry < chrono::Utc::now() {
            return Err(AppError::NotAllowed {
                error: "Share expired".to_string(),
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
    pub share_file: ParsedShareFileModel,
}

pub async fn get_share_file(
    state: &AppState,
    file_id: Option<i64>,
) -> Result<SharedFileData, AppError> {
    let file = match file_id {
        None => Err(AppError::NotFound {
            error: "File not found".to_string(),
        })?,
        Some(file_id) => state.file_service.get_file(file_id).await?,
    };

    let share_file = FileService::parse_share_file(file.clone());

    Ok(SharedFileData { file, share_file })
}

pub struct SharedFolderData {
    share_folder: ParsedShareFolderModel,
    folders: Vec<ParsedShareFolderModel>,
    files: Vec<ParsedShareFileModel>,
}

pub async fn get_share_folder(
    state: &AppState,
    folder_id: Option<i64>,
) -> Result<
    SharedFolderData,
    AppError,
> {
    let folder = match folder_id {
        None => Err(AppError::NotFound {
            error: "Folder not found".to_string(),
        })?,
        Some(folder_id) => state.folder_service.get_folder(folder_id).await?,
    };

    let share_folder = FolderService::parse_share_folder(&folder);

    let folders = state
        .folder_service
        .get_folders_for_share(&Some(folder.id))
        .await?
        .into_iter()
        .map(|folder| FolderService::parse_share_folder(&folder))
        .collect::<Vec<_>>();

    let files = state
        .file_service
        .get_files_for_share(Some(folder.id))
        .await?
        .into_iter()
        .map(|file| FileService::parse_share_file(file))
        .collect::<Vec<_>>();

    Ok(SharedFolderData {
        share_folder,
        folders,
        files,
    })
}

pub async fn reduce_access_limit(state: &AppState, share: &ShareModel) -> Result<(), AppError> {
    if let Some(uses) = share.access_limit {
        state
            .share_service
            .update_access_limit(&share.id, uses - 1)
            .await?;
    };
    Ok(())
}
