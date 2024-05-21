use crate::model::file::FileType;
use axum::body::Bytes;
use axum::extract::rejection::PathRejection;
use axum::extract::{Multipart, Path, Query, State};
use axum::{BoxError, Json};
use futures::{Stream, TryStreamExt};
use serde::Deserialize;
use std::io;
use tokio::fs::File;
use tokio::io::BufWriter;
use tokio_util::io::StreamReader;
use tower_sessions::Session;

use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::file_service::FileService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

#[derive(Debug, Deserialize)]
pub enum SortOrder {
    Asc,
    Desc,
}

#[derive(Deserialize)]
pub struct SortParams {
    pub sort_order: Option<SortOrder>,
}

#[derive(Debug)]
pub struct Sort {
    pub sort_order: SortOrder,
}

pub async fn get_files(
    State(state): KosmosState,
    session: Session,
    Query(sort_params): Query<SortParams>,
    folder_id: Result<Path<i64>, PathRejection>,
) -> Result<Json<serde_json::Value>, AppError> {
    let sort = Sort {
        sort_order: sort_params.sort_order.unwrap_or(SortOrder::Desc),
    };

    //TODO: Add sorting


    let folder = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };

    let user_id = SessionService::check_logged_in(&session).await?;

    let files = state
        .file_service
        .get_files(user_id, folder)
        .await?
        .into_iter()
        .map(FileService::parse_file)
        .collect::<Vec<_>>();

    Ok(Json(serde_json::json!(files)))
}

pub async fn delete_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let file = state
        .file_service
        .check_file_exists_by_id(file_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    state
        .image_service
        .delete_formats_from_file_id(file_id)
        .await?;
    state.file_service.delete_file(file.id).await?;

    Ok(AppSuccess::DELETED)
}

#[derive(Deserialize)]
pub struct MoveParams {
    pub folder_id: i64,
}

pub async fn move_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
    params: Option<Query<MoveParams>>,
) -> ResponseResult {
    let move_to_folder = params.map(|params| params.folder_id);

    let user_id = SessionService::check_logged_in(&session).await?;

    // Check if file exists and returns not found if it doesn't
    let file = match state
        .file_service
        .check_file_exists_by_id(file_id, user_id)
        .await?
    {
        None => {
            return Err(AppError::NotFound {
                error: "File not found".to_string(),
            })
        }
        Some(file) => file,
    };

    if let Some(move_to_folder) = move_to_folder {
        if !state
            .folder_service
            .check_folder_exists_by_id(move_to_folder, user_id)
            .await?
            .is_some()
        {
            return Err(AppError::NotFound {
                error: "Folder not found".to_string(),
            });
        }
    }

    let is_file_already_in_destination_folder = state
        .file_service
        .check_file_exists_in_folder(&file.file_name, move_to_folder)
        .await?;

    if is_file_already_in_destination_folder {
        return Err(AppError::BadRequest {
            error: Some("File already exists in destination folder".to_string()),
        });
    }

    state
        .file_service
        .move_file(user_id, file_id, move_to_folder)
        .await?;

    Ok(AppSuccess::MOVED)
}

pub async fn upload_file(
    State(state): KosmosState,
    session: Session,
    folder_id: Result<Path<i64>, PathRejection>,
    mut multipart: Multipart,
) -> ResponseResult {
    let folder = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };

    let user_id = SessionService::check_logged_in(&session).await?;

    let location = std::env::var("UPLOAD_LOCATION").unwrap();

    while let Ok(Some(field)) = multipart.next_field().await {
        let file_name = if let Some(file_name) = field.file_name() {
            if file_name.len() > 250 {
                return Err(AppError::InternalError);
            }
            file_name.to_owned()
        } else {
            continue;
        };

        let id = state.sf.next_id().map_err(|_| AppError::InternalError)? as i64;
        let ct = field.content_type().unwrap().to_string();
        let file_type = FileService::get_file_type(&ct);

        let exists = state
            .file_service
            .check_file_exists_by_name(&file_name, user_id, folder)
            .await?;

        if let Some(file) = exists {
            state
                .image_service
                .delete_formats_from_file_id(file)
                .await?;
            state.file_service.delete_file(file).await?;

            tracing::info!("File {} deleted for replacement {}", file, id);
        }

        match stream_to_file(&location, &id.to_string(), field).await {
            Ok(len) => {
                let new_file = state
                    .file_service
                    .create_file(user_id, id, file_name, len as i64, file_type, ct, folder)
                    .await?;

                if file_type == FileType::Image {
                    state.image_service.generate_image_sizes(new_file).await?;
                }
            }
            Err(err) => {
                tracing::error!("{}", err);
                return Err(AppError::InternalError);
            }
        };
    }

    Ok(AppSuccess::OK { data: None })
}

#[derive(Deserialize)]
pub struct RenameParams {
    pub name: String,
}

pub async fn rename_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
    Json(params): Json<RenameParams>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let file = state
        .file_service
        .check_file_exists_by_id(file_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    state
        .file_service
        .rename_file(user_id, file.id, params.name, file.parent_folder_id)
        .await?;

    Ok(AppSuccess::UPDATED)
}

async fn stream_to_file<S, E>(path: &str, name: &str, stream: S) -> Result<u64, String>
where
    S: Stream<Item = Result<Bytes, E>>,
    E: Into<BoxError>,
{
    async {
        // Convert the stream into an `AsyncRead`.
        let body_with_io_error = stream.map_err(|err| io::Error::new(io::ErrorKind::Other, err));
        let body_reader = StreamReader::new(body_with_io_error);
        futures::pin_mut!(body_reader);

        // Create the file. `File` implements `AsyncWrite`.
        let path = std::path::Path::new(path).join(name);
        let mut file = BufWriter::new(File::create(&path).await?);

        // Copy the body into the file.
        match tokio::io::copy(&mut body_reader, &mut file).await {
            Err(e) => {
                tracing::error!("Error copying file from stream: {}", e);
                let _ = tokio::fs::remove_file(&path).await;
                return Err(e);
            }
            Ok(len) => Ok(len),
        }
    }
    .await
    .map_err(|err| err.to_string())
}
