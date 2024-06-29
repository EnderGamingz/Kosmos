use crate::model::file::{FileModel, ParsedShareFileModel};
use crate::model::share::ShareModel;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::file_service::FileService;
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
    let share = is_allowed_to_access_share(&state, session, share_uuid.clone(), false).await?;

    let (_, share_file) = get_share_file(&state, &share).await?;
    let _ = state.share_service.handle_share_access(share.id).await;

    Ok(Json(serde_json::json!(share_file)))
}

pub async fn is_allowed_to_access_share(
    state: &AppState,
    session: Session,
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

pub async fn get_share_file(
    state: &AppState,
    share: &ShareModel,
) -> Result<(FileModel, ParsedShareFileModel), AppError> {
    let file = match share.file_id {
        None => Err(AppError::NotFound {
            error: "File not found".to_string(),
        })?,
        Some(file_id) => state.file_service.get_file(file_id).await?,
    };

    let share_file = FileService::parse_share_file(file.clone());

    Ok((file, share_file))
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
