use crate::model::share::ShareType;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use chrono::{DateTime, Utc};
use serde::Deserialize;
use tower_sessions::Session;
use crate::utils::auth;

#[derive(Deserialize)]
pub struct ShareFilePublicRequest {
    pub(crate) file_id: String,
    pub(crate) password: Option<String>,
    pub(crate) limit: Option<i32>,
    pub(crate) expires_at: Option<DateTime<Utc>>,
}

pub async fn share_file_public(
    State(state): KosmosState,
    session: Session,
    Json(mut payload): Json<ShareFilePublicRequest>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let file_id = payload
        .file_id
        .parse::<i64>()
        .map_err(|_| AppError::BadRequest {
            error: Some("Invalid file id".to_string()),
        })?;

    /* This check for already existing similar shares for this item might be unnecessary
    let share = match payload.password {
        None => {  state
                .share_service
                .get_public_share_by_type_file(payload.file_id, user_id)
                .await?
        }, Some(_) => None };*/

    // Check if file exists by the logged-in user
    state.file_service.get_file(file_id, Some(user_id)).await?;

    if let Some(password) = payload.password {
        let hashed_password = auth::hash_password(password.as_str())?;
        payload.password = Some(hashed_password);
    }

    let uuid = state
        .share_service
        .create_public_file_share(file_id, payload, user_id)
        .await?
        .uuid;

    Ok(AppSuccess::CREATED {
        id: Some(uuid.to_string()),
    })
}

#[derive(Deserialize)]
pub struct ShareFolderPublicRequest {
    pub(crate) folder_id: String,
    pub(crate) password: Option<String>,
    pub(crate) limit: Option<i32>,
    pub(crate) expires_at: Option<DateTime<Utc>>,
}

pub async fn share_folder_public(
    State(state): KosmosState,
    session: Session,
    Json(mut payload): Json<ShareFolderPublicRequest>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let folder_id = payload
        .folder_id
        .parse::<i64>()
        .map_err(|_| AppError::BadRequest {
            error: Some("Invalid folder id".to_string()),
        })?;
    let folder = state.folder_service.get_folder(folder_id).await?;

    if folder.user_id != user_id {
        return Err(AppError::NotAllowed {
            error: "Not allowed".to_string(),
        });
    }

    let is_folder_already_shared = state
        .share_service
        .is_any_folder_above_already_shared(
            folder_id,
            ShareType::Public,
            None,
            &state.folder_service,
        )
        .await?;

    if is_folder_already_shared {
        return Err(AppError::BadRequest {
            error: Some("Folder is already contained in a public share".to_string()),
        });
    }

    if let Some(password) = payload.password {
        let hashed_password = auth::hash_password(password.as_str())?;
        payload.password = Some(hashed_password);
    }

    let uuid = state
        .share_service
        .create_public_folder_share(folder_id, payload, user_id)
        .await?
        .uuid;

    Ok(AppSuccess::CREATED {
        id: Some(uuid.to_string()),
    })
}

#[derive(Deserialize)]
pub struct ShareFilePrivateRequest {
    pub(crate) file_id: String,
    pub(crate) target_username: String,
}

pub async fn share_file_private(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<ShareFilePrivateRequest>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let file_id = payload
        .file_id
        .parse::<i64>()
        .map_err(|_| AppError::BadRequest {
            error: Some("Invalid file id".to_string()),
        })?;

    let target_user = match state
        .user_service
        .get_user_by_username_optional(&payload.target_username)
        .await?
    {
        None => return Err(AppError::UserNotFound),
        Some(u) => u,
    };

    if user_id == target_user.id {
        return Err(AppError::BadRequest {
            error: Some("Cannot share with yourself".to_string()),
        });
    }

    let existing_share = state
        .share_service
        .get_private_share_by_target(target_user.id, user_id)
        .await?;

    if existing_share.is_some() {
        return Err(AppError::BadRequest {
            error: Some("Already shared with this user".to_string()),
        });
    }

    let share = state
        .share_service
        .create_private_file_share(file_id, user_id, target_user.id)
        .await?;

    Ok(AppSuccess::CREATED {
        id: Some(share.uuid.to_string()),
    })
}

#[derive(Deserialize)]
pub struct ShareFolderPrivateRequest {
    pub(crate) folder_id: String,
    pub(crate) target_username: String,
}

pub async fn share_folder_private(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<ShareFolderPrivateRequest>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let folder_id = payload
        .folder_id
        .parse::<i64>()
        .map_err(|_| AppError::BadRequest {
            error: Some("Invalid folder id".to_string()),
        })?;

    let target_user = match state
        .user_service
        .get_user_by_username_optional(&payload.target_username)
        .await?
    {
        None => return Err(AppError::UserNotFound),
        Some(u) => u,
    };

    if user_id == target_user.id {
        return Err(AppError::BadRequest {
            error: Some("Cannot share with yourself".to_string()),
        });
    };

    // This would check for any file or folder in the target hierarchy that is already shared.
    // Using it would not allow folders to be shared with something already shared inside it.
    /*    let existing_share = state
            .share_service
            .get_private_share_by_target(target_user.id, user_id)
            .await?;
    */
    let is_folder_already_shared = state
        .share_service
        .is_any_folder_above_already_shared(
            folder_id,
            ShareType::Private,
            Some(target_user.id),
            &state.folder_service,
        )
        .await?;

    // existing_share.is_some() ||
    if is_folder_already_shared {
        return Err(AppError::BadRequest {
            error: Some("Already shared with this user".to_string()),
        });
    }

    let share = state
        .share_service
        .create_private_folder_share(folder_id, user_id, target_user.id)
        .await?;

    Ok(AppSuccess::CREATED {
        id: Some(share.uuid.to_string()),
    })
}
