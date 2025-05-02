use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;
use crate::model::jwt::JwtClaims;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::profile_service::UpdateProfileDTO;
use crate::state::KosmosState;

pub async fn update_profile(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Json(profile): Json<UpdateProfileDTO>,
) -> ResponseResult {

    state
        .profile_service
        .update_profile(claims.user.user_id.into(), &profile)
        .await?;

    Ok(AppSuccess::UPDATED)
}