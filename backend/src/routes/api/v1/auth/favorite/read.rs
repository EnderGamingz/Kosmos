use axum::extract::State;
use axum::Json;
use serde::Serialize;
use tower_sessions::Session;
use ts_rs::TS;
use crate::model::file::FileModelDTO;
use crate::model::folder::FolderModelDTO;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

#[derive(Serialize, TS)]
#[ts(export)]
pub struct FavoritesResponse {
    folders: Vec<FolderModelDTO>,
    files: Vec<FileModelDTO>,
}

pub async fn get_favorites(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<FavoritesResponse>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let favorites = FavoritesResponse {
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
