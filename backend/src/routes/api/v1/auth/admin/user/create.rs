use crate::model::jwt::JwtClaims;
use crate::model::role::Permission;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;
use crate::utils::auth;
use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;
use axum_valid::Valid;
use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
pub struct AdminCreateUser {
    #[validate(length(min = 3, message = "Username must be at least 3 characters"))]
    pub username: String,
    #[validate(length(min = 6, message = "Password must be at least 6 characters"))]
    pub password: String,
    storage_limit: i64,
}

pub async fn create_user(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Valid(Json(payload)): Valid<Json<AdminCreateUser>>,
) -> ResponseResult {
    state
        .permission_service
        .verify_permission(&claims, Permission::CreateUser)
        .await?;

    let existing_user = state
        .user_service
        .get_user_by_username_optional(&payload.username)
        .await?;

    if existing_user.is_some() {
        return Err(AppError::BadRequest {
            error: Some("User already exists".to_string()),
        })?;
    }

    let hashed_password = auth::hash_password(payload.password.as_str())?;

    let new_user_id = state
        .user_service
        .create_user(payload.username, hashed_password, payload.storage_limit)
        .await?;

    Ok(AppSuccess::CREATED {
        id: Some(new_user_id.to_string()),
    })
}
