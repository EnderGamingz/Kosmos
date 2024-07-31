use axum::extract::{Path, Query, State};
use axum::Json;
use serde::Serialize;
use tower_sessions::Session;

use crate::model::album::AlbumModelDTO;
use crate::model::file::{FileModel, FileModelDTO};
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::file::GetFilesByType;
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
        .get_associated_albums(user_id, file_id)
        .await?
        .into_iter()
        .map(AlbumModelDTO::from)
        .collect();

    Ok(Json(albums))
}

#[derive(Serialize)]
pub struct AvailableAlbumsForFileResponse {
    pub added: Vec<AlbumModelDTO>,
    pub available: Vec<AlbumModelDTO>,
}

pub async fn get_available_albums_for_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> Result<Json<AvailableAlbumsForFileResponse>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let available_albums: Vec<AlbumModelDTO> = state
        .album_service
        .get_unassociated_albums(user_id, file_id)
        .await?
        .into_iter()
        .map(AlbumModelDTO::from)
        .collect();

    let associated_albums: Vec<AlbumModelDTO> = state
        .album_service
        .get_associated_albums(user_id, file_id)
        .await?
        .into_iter()
        .map(AlbumModelDTO::from)
        .collect();

    Ok(Json(
        AvailableAlbumsForFileResponse {
            added: associated_albums,
            available: available_albums
        }
    ))
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

pub async fn get_available_files(
    State(state): KosmosState,
    session: Session,
    Query(params): Query<GetFilesByType>,
) -> Result<Json<Vec<FileModelDTO>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let file_types = FileModel::get_valid_file_types_for_album();

    let files = state
        .file_service
        .get_files_by_file_type(user_id, file_types, params.get_limit(), params.get_page())
        .await?
        .into_iter()
        .map(FileModelDTO::from)
        .collect();

    Ok(Json(files))
}
