use crate::model::jwt::JwtClaims;
use crate::model::role::Permission;
use crate::model::user::UserModelDTO;
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::user::usage::{get_usage_stats_by_user_id, DiskUsageStats};
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use axum_jwt_auth::Claims;

pub async fn get_all_users(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
) -> Result<Json<Vec<UserModelDTO>>, AppError> {
    state
        .permission_service
        .verify_permission(&claims, Permission::ListUser)
        .await?;

    let users = state.user_service.get_all_users().await?;

    let users_dto: Vec<UserModelDTO> = users.into_iter().map(UserModelDTO::from).collect();

    Ok(Json(users_dto))
}

pub async fn get_user(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(user_id): Path<i64>,
) -> Result<Json<UserModelDTO>, AppError> {
    state
        .permission_service
        .verify_permission(&claims, Permission::ReadUser)
        .await?;

    let user = state.user_service.get_auth_user(user_id).await?;

    Ok(Json(user.into()))
}

pub async fn get_user_usage(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(user_id): Path<i64>,
) -> Result<Json<DiskUsageStats>, AppError> {
    state
        .permission_service
        .verify_permission(&claims, Permission::ReadUser)
        .await?;

    let user = state.user_service.get_auth_user(user_id).await?;

    let usage = get_usage_stats_by_user_id(&state, user.id).await?;
    Ok(Json(usage))
}
