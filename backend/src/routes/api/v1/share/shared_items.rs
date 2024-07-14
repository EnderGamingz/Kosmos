use axum::extract::State;
use axum::Json;
use serde::Serialize;
use tower_sessions::Session;

use crate::model::file::ParsedFileModelWithShareInfo;
use crate::model::folder::ParsedFolderModelWithShareInfo;
use crate::response::error_handling::AppError;
use crate::services::file_service::FileService;
use crate::services::folder_service::FolderService;
use crate::services::session_service::{SessionService, UserId};
use crate::state::{AppState, KosmosState};

#[derive(Serialize)]
pub struct SharedItems {
    files: Vec<ParsedFileModelWithShareInfo>,
    folders: Vec<ParsedFolderModelWithShareInfo>,
}

impl SharedItems {
    async fn get_shared_files_and_folders(
        state: &AppState,
        user_id: &UserId,
        targeted: bool,
    ) -> Result<SharedItems, AppError> {
        let files = state
            .share_service
            .get_shared_files(user_id, targeted)
            .await?
            .into_iter()
            .map(|file| FileService::parse_file_with_share_info(file))
            .collect::<Vec<_>>();

        let folders = state
            .share_service
            .get_shared_folders(user_id, targeted)
            .await?
            .into_iter()
            .map(|folder| FolderService::parse_folder_with_share_info(&folder))
            .collect::<Vec<_>>();

        Ok(SharedItems { files, folders })
    }
}

pub async fn get_shared_items(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<SharedItems>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let shared = SharedItems::get_shared_files_and_folders(&state, &user_id, false).await?;
    Ok(Json(shared))
}

pub async fn get_targeted_shared_items_for_user(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<SharedItems>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let shared = SharedItems::get_shared_files_and_folders(&state, &user_id, true).await?;
    Ok(Json(shared))
}
