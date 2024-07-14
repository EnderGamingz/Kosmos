use axum::extract::{Path, State};
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

use crate::model::role::{Permission, Role};
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::user_service::UpdateUserRequest;
use crate::state::KosmosState;
use crate::utils::{auth, string, validation};

#[derive(Deserialize)]
pub struct AdminUpdateUserPayload {
    pub username: Option<String>,
    pub email: Option<String>,
    pub full_name: Option<String>,
    pub new_password: Option<String>,
    pub storage_limit: Option<i64>,
    pub new_role: Option<i16>,
}

pub async fn update_user(
    State(state): KosmosState,
    session: Session,
    Path(user_id): Path<i64>,
    Json(payload): Json<AdminUpdateUserPayload>,
) -> ResponseResult {
    let admin = state
        .permission_service
        .verify_permission(&session, Permission::UpdateUser)
        .await?;

    let user = state.user_service.get_auth_user(user_id).await?;

    let mut user_update = UpdateUserRequest {
        username: user.username.clone(),
        email: None,
        full_name: None,
    };

    if let Some(username) = payload.username {
        let username = validation::verify_username(username.as_str())?;
        if username != user.username {
            let exists = state
                .user_service
                .get_user_by_username_optional(&username)
                .await?;
            if exists.is_some() {
                return Err(AppError::DataConflict {
                    error: "Username already in use".to_string(),
                });
            }
        }
        user_update.username = username;
    }

    if let Some(email) = payload.email {
        user_update.email = Some(string::remove_whitespace(&email));
    }
    if let Some(full_name) = payload.full_name {
        user_update.full_name = Some(full_name);
    }

    if let Some(new_role) = payload.new_role {
        let selected_role = Role::by_id(new_role);
        if admin.id == user.id && !selected_role.has_permission(Permission::UpdateUser) {
            return Err(AppError::NotAllowed {
                error: "Role change is not allowed".to_string(),
            });
        }

        state.user_service.update_role(user.id, selected_role).await?;
    }

    if let Some(new_password) = payload.new_password {
        validation::validate_password(&new_password)?;
        let hash = auth::hash_password(&new_password)?;
        state
            .user_service
            .update_user_password(user.id, hash)
            .await?;
    }

    if let Some(storage_limit) = payload.storage_limit {
        state
            .user_service
            .update_storage_limit(user.id, storage_limit)
            .await?;
    }

    state.user_service.update_user(user.id, user_update).await?;

    Ok(AppSuccess::UPDATED)
}
