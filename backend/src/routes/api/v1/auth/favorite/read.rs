use axum::extract::State;
use axum::Json;
use serde::Serialize;
use tower_sessions::Session;

use crate::model::file::FileModelDTO;
use crate::model::folder::FolderModelDTO;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

#[derive(Serialize)]
pub struct GetFavoritesResponse {
    folders: Vec<FolderModelDTO>,
    files: Vec<FileModelDTO>,
}

pub async fn get_favorites(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<GetFavoritesResponse>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let favorites = GetFavoritesResponse {
        folders: state
            .folder_service
            .get_favorites(user_id)
            .await?
            .into_iter()
            .map(FolderModelDTO::from)
            .collect(),
        files: state
            .file_service
            .get_favorites(user_id)
            .await?
            .into_iter()
            .map(FileModelDTO::from)
            .collect(),
    };

    Ok(Json(favorites))
}
