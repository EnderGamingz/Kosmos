use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;
use crate::utils::auth;
use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;

#[derive(serde::Deserialize)]
pub struct DeleteSelfUserRequest {
    pub password: String,
}

pub async fn delete_self(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Json(payload): Json<DeleteSelfUserRequest>,
) -> ResponseResult {
    let user = state
        .user_service
        .get_auth_user(claims.user.user_id)
        .await?;

    let password_flag = auth::verify_password(payload.password.as_str(), &user.password_hash)?;

    if !password_flag {
        return Err(AppError::Forbidden {
            error: Some("Wrong password provided".to_string()),
        });
    }

    let files = state
        .file_service
        .get_files_for_user_delete(claims.user.user_id)
        .await?;

    for file in files {
        state
            .file_service
            .permanently_delete_file(file.id, Some(file.file_type))
            .await?;
    }

    state
        .folder_service
        .delete_all_folders(claims.user.user_id)
        .await?;

    state.user_service.delete_user(claims.user.user_id).await?;

    Ok(AppSuccess::DELETED)
}
