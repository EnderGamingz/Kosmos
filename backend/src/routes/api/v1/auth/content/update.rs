use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use axum_jwt_auth::Claims;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct UpdateFileContentPayload {
    pub content: String,
}

pub async fn update_file_contents(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(file_id): Path<i64>,
    Json(payload): Json<UpdateFileContentPayload>,
) -> ResponseResult {
    let file = state
        .file_service
        .get_file(file_id, Some(claims.user.user_id))
        .await?;

    if !file.is_valid_to_edit_content() {
        return Err(AppError::BadRequest {
            error: Some("File is not editable".to_string()),
        });
    }

    state
        .file_service
        .update_file_content(file_id, payload.content)
        .await?;

    Ok(AppSuccess::UPDATED)
}
