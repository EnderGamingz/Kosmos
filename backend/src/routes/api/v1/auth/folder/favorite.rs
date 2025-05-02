use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum_jwt_auth::Claims;
use crate::model::jwt::JwtClaims;

pub async fn favorite_folder(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(folder_id): Path<i64>,
) -> ResponseResult {
    let folder = state
        .folder_service
        .check_folder_exists_by_id(folder_id, claims.user.user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "Folder not found".to_string(),
        })?;

    state.folder_service.set_favorite(folder.id, !folder.favorite).await?;

    Ok(AppSuccess::UPDATED)
}
