use axum::extract::{Path, State};
use axum::Json;
use serde::Serialize;
use tower_sessions::Session;

use crate::model::album::AlbumModelDTO;
use crate::model::file::FileModelDTO;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn get_albums(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<Vec<AlbumModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let albums: Vec<AlbumModelDTO> = state
        .album_service
        .get_albums(user_id)
        .await?
        .into_iter()
        .map(AlbumModelDTO::from)
        .collect();

    Ok(Json(albums))
}

pub async fn get_albums_for_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> Result<Json<Vec<AlbumModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let albums: Vec<AlbumModelDTO> = state
        .album_service
        .get_associated_albums(user_id,file_id)
        .await?
        .into_iter()
        .map(AlbumModelDTO::from)
        .collect();

    Ok(Json(albums))
}

#[derive(Serialize)]
pub struct AlbumResponse {
    pub album: AlbumModelDTO,
    pub files: Vec<FileModelDTO>,
}

pub async fn get_album(
    State(state): KosmosState,
    session: Session,
    Path(album_id): Path<i64>,
) -> Result<Json<AlbumResponse>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let album = state
        .album_service
        .get_album_by_id(user_id, album_id)
        .await?;

    let files = state.album_service.get_album_files(album.id).await?;

    Ok(Json(AlbumResponse {
        album: album.into(),
        files: files.into_iter().map(FileModelDTO::from).collect(),
    }))
}

