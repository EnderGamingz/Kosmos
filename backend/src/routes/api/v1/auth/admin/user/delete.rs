use axum::extract::{Path, State};
use tower_sessions::Session;
use crate::model::file::FileType;
use crate::model::role::Permission;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;

pub async fn delete_user(
    State(state): KosmosState,
    session: Session,
    Path(user_id): Path<i64>,
) -> ResponseResult {
    let admin = state
        .permission_service
        .verify_permission(&session, Permission::DeleteUser)
        .await?;

    let user_to_delete = state.user_service.get_auth_user(user_id).await?;

    if admin.id == user_to_delete.id {
        Err(AppError::NotAllowed {
            error: "You cannot delete yourself".to_string(),
        })?
    }

    let files = state
        .file_service
        .get_files_for_user_delete(user_id)
        .await?;

    for file in files {
        state
            .file_service
            .permanently_delete_file(file.id, Some(FileType::by_id(file.file_type)))
            .await?;
    }

    state.folder_service.delete_all_folders(user_id).await?;

    state.user_service.delete_user(user_to_delete.id).await?;

    Ok(AppSuccess::DELETED)
}
