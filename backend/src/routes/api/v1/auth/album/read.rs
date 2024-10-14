use axum::extract::{Path, Query, State};
use axum::Json;
use serde::{Deserialize, Serialize};
use tower_sessions::Session;

use crate::model::album::AlbumModelDTO;
use crate::model::file::FileModelDTO;
use crate::model::internal::file_type::FileType;
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

#[derive(Deserialize)]
pub struct GetAvailableAlbumsPayload {
    pub files: Vec<String>,
}

impl GetAvailableAlbumsPayload {
    pub fn get_file_ids(&self) -> Result<Vec<i64>, AppError> {
        self.files
            .iter()
            .map(|f| f.parse::<i64>())
            .collect::<Result<Vec<i64>, _>>()
            .map_err(|_| AppError::BadRequest {
                error: Some("Invalid file ids".to_string()),
            })
    }
}

#[derive(Serialize)]
pub struct AvailableAlbumsForFileResponse {
    pub added: Vec<AlbumModelDTO>,
    pub available: Vec<AlbumModelDTO>,
}

pub async fn get_available_albums_for_files(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<GetAvailableAlbumsPayload>,
) -> Result<Json<AvailableAlbumsForFileResponse>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let file_ids = payload.get_file_ids()?;

    if file_ids.is_empty() {
        return Err(AppError::BadRequest {
            error: Some("No files provided".to_string()),
        });
    }

    let available_albums: Vec<AlbumModelDTO> = state
        .album_service
        .get_unassociated_albums(user_id, &file_ids)
        .await?
        .into_iter()
        .map(AlbumModelDTO::from)
        .collect();

    let associated_albums = if let Some(id) = file_ids.first() {
        if file_ids.len() > 1 {
            Vec::new()
        } else {
            state
                .album_service
                .get_associated_albums(user_id, *id)
                .await?
                .into_iter()
                .map(AlbumModelDTO::from)
                .collect()
        }
    } else {
        Vec::new()
    };

    Ok(Json(AvailableAlbumsForFileResponse {
        added: associated_albums,
        available: available_albums,
    }))
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
        .get_album_by_id(Some(user_id), album_id)
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
    let file_types = FileType::VALID_FILE_TYPES_FOR_ALBUM;

    let files = state
        .file_service
        .get_files_by_file_type(
            user_id,
            Vec::from(file_types),
            params.get_limit(),
            params.get_page(),
        )
        .await?
        .into_iter()
        .map(FileModelDTO::from)
        .collect();

    Ok(Json(files))
}
