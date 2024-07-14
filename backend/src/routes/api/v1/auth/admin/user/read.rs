use axum::extract::{Path, State};
use axum::Json;
use tower_sessions::Session;

use crate::model::role::Permission;
use crate::model::user::UserModelDTO;
use crate::response::error_handling::AppError;
use crate::state::KosmosState;

pub async fn get_all_users(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<serde_json::Value>, AppError> {
    state
        .permission_service
        .verify_permission(&session, Permission::ListUser)
        .await?;

    let users = state.user_service.get_all_users().await?;

    let users_dto: Vec<UserModelDTO> = users.into_iter().map(UserModelDTO::from).collect();

    Ok(Json(serde_json::json!(users_dto)))
}

pub async fn get_user(
    State(state): KosmosState,
    session: Session,
    Path(user_id): Path<i64>,
) -> Result<Json<serde_json::Value>, AppError> {
    state
        .permission_service
        .verify_permission(&session, Permission::ReadUser)
        .await?;

    let user = state
        .user_service
        .get_auth_user(user_id)
        .await?;

    let user_dto:UserModelDTO = user.into();

    Ok(Json(serde_json::json!(user_dto)))
}
