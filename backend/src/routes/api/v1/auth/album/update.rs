use axum::extract::{Path, State};
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

#[derive(Deserialize)]
pub struct UpdateAlbumPayload {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
}

impl UpdateAlbumPayload {
    pub fn get_id(&self) -> Result<i64, AppError> {
        self.id.parse::<i64>().map_err(|_| AppError::BadRequest {
            error: Some("Invalid album id".to_string()),
        })
    }
}

pub async fn update_album(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<UpdateAlbumPayload>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let album = state
        .album_service
        .get_album_by_id(Some(user_id), payload.get_id()?)
        .await?;

    state
        .album_service
        .update_album(user_id, album.id, payload.name, payload.description)
        .await?;

    Ok(AppSuccess::UPDATED)
}

#[derive(Deserialize)]
pub struct FilesToAlbumActionPayload {
    pub file_ids: Vec<String>,
}

impl FilesToAlbumActionPayload {
    pub fn get_file_ids(&self) -> Result<Vec<i64>, AppError> {
        self.file_ids
            .iter()
            .map(|id| id.parse::<i64>())
            .collect::<Result<Vec<i64>, _>>()
            .map_err(|_| AppError::BadRequest {
                error: Some("Invalid file id".to_string()),
            })
    }
}

pub async fn link_files_to_album(
    State(state): KosmosState,
    session: Session,
    Path(album_id): Path<i64>,
    Json(payload): Json<FilesToAlbumActionPayload>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let album = state
        .album_service
        .get_album_by_id(Some(user_id), album_id)
        .await?;

    let files = state.album_service.get_album_files(album.id).await?;

    let file_ids = payload.get_file_ids()?;
    // Check all files
    for file_id in file_ids.iter() {
        let file = state.file_service.get_file(*file_id, Some(user_id)).await?;
        // Check if file is valid for album, e.g. if it is an image
        if !file.is_valid_for_album() {
            return Err(AppError::BadRequest {
                error: Some("File is not valid for album".to_string()),
            });
        }
    }

    state
        .album_service
        .add_files_to_album(album.id, &file_ids)
        .await?;

    // Set preview file
    if files.is_empty() && !file_ids.is_empty() {
        let _ = state
            .album_service
            .set_preview_id(user_id, album.id, Some(file_ids[0]))
            .await?;
    }

    Ok(AppSuccess::UPDATED)
}

pub async fn unlink_file_from_album(
    State(state): KosmosState,
    session: Session,
    Path(album_id): Path<i64>,
    Json(payload): Json<FilesToAlbumActionPayload>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let album = state
        .album_service
        .get_album_by_id(Some(user_id), album_id)
        .await?;

    let file_ids = payload.get_file_ids()?;

    // Check all files
    for file_id in file_ids.iter() {
        state.file_service.get_file(*file_id, Some(user_id)).await?;
    }

    state
        .album_service
        .remove_files_from_album(album.id, &file_ids)
        .await?;

    // Remove preview file when it is removed from album
    if let Some(preview_id) = album.preview_id {
        if file_ids.contains(&preview_id) {
            state
                .album_service
                .set_preview_id(user_id, album.id, None)
                .await?;
        }
    }

    Ok(AppSuccess::UPDATED)
}

#[derive(Deserialize)]
pub struct UpdateAlbumPreviewPayload {
    pub file_id: String,
}

impl UpdateAlbumPreviewPayload {
    pub fn get_file_id(&self) -> Result<i64, AppError> {
        self.file_id
            .parse::<i64>()
            .map_err(|_| AppError::BadRequest {
                error: Some("Invalid file id".to_string()),
            })
    }
}

pub async fn update_album_preview(
    State(state): KosmosState,
    session: Session,
    Path(album_id): Path<i64>,
    Json(payload): Json<UpdateAlbumPreviewPayload>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let album = state
        .album_service
        .get_album_by_id(Some(user_id), album_id)
        .await?;

    let new_preview_id = payload.get_file_id()?;

    if !state
        .album_service
        .is_file_in_album(album.id, new_preview_id)
        .await?
    {
        return Err(AppError::BadRequest {
            error: Some("File is not in album".to_string()),
        });
    }

    state
        .album_service
        .set_preview_id(user_id, album.id, Some(new_preview_id))
        .await?;

    Ok(AppSuccess::UPDATED)
}
