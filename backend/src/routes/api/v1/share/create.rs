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

#[derive(Deserialize)]
pub struct ShareFilePublicRequest {
    pub(crate) file_id: i64,
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
    let share = state
        .share_service
        .get_public_share_by_type_file(payload.file_id, user_id)
        .await?;

    if payload.password.is_some() {
        let hashed_password = bcrypt::hash(payload.password.unwrap(), bcrypt::DEFAULT_COST)
            .map_err(|e| {
                tracing::error!("Error hashing password: {}", e);
                AppError::InternalError
            })?;
        payload.password = Some(hashed_password);
    }

    let uuid = match share {
        None => {
            state
                .share_service
                .create_public_file_share(payload, user_id)
                .await?
                .uuid
        }
        Some(s) => s.uuid,
    };

    Ok(AppSuccess::CREATED { id: Some(uuid) })
}

#[derive(Deserialize)]
pub struct ShareFolderPublicRequest {
    pub(crate) folder_id: i64,
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
    let folder = state.folder_service.get_folder(payload.folder_id).await?;

    if folder.user_id != user_id {
        return Err(AppError::NotAllowed {
            error: "Not allowed".to_string(),
        });
    }

    let is_folder_already_shared = state
        .share_service
        .is_any_folder_above_already_shared(
            payload.folder_id,
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

    if payload.password.is_some() {
        let hashed_password = bcrypt::hash(payload.password.unwrap(), bcrypt::DEFAULT_COST)
            .map_err(|e| {
                tracing::error!("Error hashing password: {}", e);
                AppError::InternalError
            })?;
        payload.password = Some(hashed_password);
    }

    let uuid = state
        .share_service
        .create_public_folder_share(payload, user_id)
        .await?
        .uuid;

    Ok(AppSuccess::CREATED { id: Some(uuid) })
}

#[derive(Deserialize)]
pub struct ShareFilePrivateRequest {
    pub(crate) file_id: i64,
    pub(crate) target_username: String,
}

pub async fn share_file_private(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<ShareFilePrivateRequest>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

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
        .create_private_file_share(payload.file_id, user_id, target_user.id)
        .await?;

    Ok(AppSuccess::CREATED {
        id: Some(share.uuid),
    })
}
