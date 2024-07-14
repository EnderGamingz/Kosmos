use crate::model::file::FileType;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use tower_sessions::Session;
use crate::utils::auth;

#[derive(serde::Deserialize)]
pub struct DeleteSelfUserRequest {
    pub password: String,
}

pub async fn delete_self(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<DeleteSelfUserRequest>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let user = state.user_service.get_auth_user(user_id).await?;

    let password_flag = auth::verify_password(payload.password.as_str(), &user.password_hash)?;

    if !password_flag {
        return Err(AppError::Forbidden {
            error: Some("Wrong password provided".to_string()),
        });
    }

    let files = state
        .file_service
        .get_files_for_user_delete(user_id)
        .await?;

    for file in files {
        state
            .file_service
            .permanently_delete_file(file.id, Some(FileType::get_type_by_id(file.file_type)))
            .await?;
    }

    state.folder_service.delete_all_folders(user_id).await?;

    state.user_service.delete_user(user_id).await?;

    SessionService::flush_session(&session).await;

    Ok(AppSuccess::DELETED)
}
