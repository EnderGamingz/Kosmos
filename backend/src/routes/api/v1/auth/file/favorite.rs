use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum_jwt_auth::Claims;

pub async fn favorite_file(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(file_id): Path<i64>,
) -> ResponseResult {
    let file = state
        .file_service
        .check_file_exists_by_id(file_id, claims.user.user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    state
        .file_service
        .set_favorite(file.id, !file.favorite)
        .await?;

    Ok(AppSuccess::UPDATED)
}
