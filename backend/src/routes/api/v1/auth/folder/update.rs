use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use axum_jwt_auth::Claims;
use regex::Regex;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct FolderRecolorPayload {
    pub color: Option<String>,
}

pub async fn recolor_folder(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(folder_id): Path<i64>,
    Json(payload): Json<FolderRecolorPayload>,
) -> ResponseResult {
    let color = if let Some(color) = &payload.color {
        color
    } else {
        state
            .folder_service
            .update_folder_color(claims.user.user_id, folder_id, None)
            .await?;
        return Ok(AppSuccess::UPDATED);
    };

    let color_test = Regex::new(r"^#([0-9a-f]{6})$").unwrap();

    if !color_test.is_match(color) {
        return Err(AppError::BadRequest {
            error: Some("Invalid hex color".to_string()),
        });
    }

    state
        .folder_service
        .update_folder_color(claims.user.user_id, folder_id, Some(color))
        .await?;

    Ok(AppSuccess::UPDATED)
}
