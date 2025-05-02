use crate::model::jwt::JwtClaims;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;
use crate::utils::auth;
use axum::extract::{Path, State};
use axum::Json;
use axum_jwt_auth::Claims;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct UpdateShareRequest {
    password: Option<String>,
}

pub async fn update_share(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(share_id): Path<i64>,
    Json(payload): Json<UpdateShareRequest>,
) -> ResponseResult {
    let share = state
        .share_service
        .get_share_for_user(share_id, claims.user.user_id)
        .await?;

    if let Some(password) = payload.password {
        let hashed_password = auth::hash_password(password.as_str())?;
        state
            .share_service
            .update_share_password(share.id, hashed_password)
            .await?;
    }

    Ok(AppSuccess::UPDATED)
}
