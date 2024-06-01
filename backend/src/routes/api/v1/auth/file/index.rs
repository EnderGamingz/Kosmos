use crate::model::file::FileType;
use axum::body::Bytes;
use axum::extract::rejection::PathRejection;
use axum::extract::{Multipart, Path, Query, State};
use axum::{BoxError, Json};
use axum_valid::Valid;
use futures::{Stream, TryStreamExt};
use serde::Deserialize;
use std::collections::{HashMap, VecDeque};
use std::io;
use tokio::fs::File;
use tokio::io::BufWriter;
use tokio_util::io::StreamReader;
use tower_sessions::Session;
use validator::Validate;

use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::runtimes::IMAGE_PROCESSING_RUNTIME;
use crate::services::file_service::FileService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

static FILE_SIZE_LIMIT: u64 = 50 * 1024 * 1024;

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
    //Query(sort_params): Query<SortParams>,
    folder_id: Result<Path<i64>, PathRejection>,
) -> Result<Json<serde_json::Value>, AppError> {
    /*    let sort = Sort {
        sort_order: sort_params.sort_order.unwrap_or(SortOrder::Desc),
    };*/

    //TODO: Add sorting

    let folder = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };

    let user_id = SessionService::check_logged_in(&session).await?;

    let files = state
        .file_service
        .get_files(user_id, folder, false)
        .await?
        .into_iter()
        .map(FileService::parse_file)
        .collect::<Vec<_>>();

    Ok(Json(serde_json::json!(files)))
}

pub async fn mark_file_for_deletion(
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

    if file.deleted_at.is_some() {
        return Err(AppError::DataConflict {
            error: "File already in bin".to_string(),
        });
    };

    state.file_service.mark_file_for_deletion(file_id).await?;

    Ok(AppSuccess::UPDATED)
}

pub async fn restore_file(
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

    if file.deleted_at.is_none() {
        return Err(AppError::DataConflict {
            error: "File is not in bin".to_string(),
        });
    };

    state.file_service.restore_file(file_id).await?;

    Ok(AppSuccess::UPDATED)
}

pub async fn get_deleted_files(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let files = state.file_service.get_marked_deleted_files(user_id).await?;
    let parsed_files = files
        .into_iter()
        .map(FileService::parse_file)
        .collect::<Vec<_>>();

    Ok(Json(serde_json::json!(parsed_files)))
}

pub async fn permanently_delete_file(
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

    if file.deleted_at.is_none() {
        return Err(AppError::BadRequest {
            error: Some("File is not marked as deleted".to_string()),
        });
    }

    state
        .image_service
        .delete_formats_from_file_id(file_id)
        .await?;

    state.file_service.permanently_delete_file(file.id).await?;

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
            });
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
    let mut folder_cache: HashMap<String, i64> = HashMap::new();
    let mut pending_image_formats: Vec<i64> = vec![];

    while let Ok(Some(field)) = multipart.next_field().await {
        let file_name_from_field = if let Some(file_name) = field.file_name() {
            if file_name.len() > 250 {
                return Err(AppError::BadRequest {
                    error: Some("File name is too long".to_string()),
                });
            }
            file_name.to_owned()
        } else {
            continue;
        };

        let mut folder_path = file_name_from_field.split("/").collect::<VecDeque<&str>>();

        if folder_path.len() == 0 {
            return Err(AppError::BadRequest {
                error: Some("File name cannot be determined".to_string()),
            });
        } else if folder_path.len() > 200 {
            return Err(AppError::BadRequest {
                error: Some("Folder Tree exceeds depth limit of 200".to_string()),
            });
        }

        let file_name = folder_path
            .pop_back()
            .ok_or_else(|| AppError::BadRequest {
                error: Some("File name cannot be determined".to_string()),
            })?
            .to_string();

        let mut relative_parent_folder = folder;

        let mut folder_path_string = "".to_string();

        while !folder_path.is_empty() {
            // Parse the path segment
            let path_segment = folder_path
                .pop_front()
                .ok_or_else(|| AppError::BadRequest {
                    error: Some("Error while parsing path segment".to_string()),
                })?
                .to_string();

            folder_path_string = format!("{}/{}", folder_path_string, path_segment);

            // Get the folder id for the upload
            // Test if the folder is already cached, if not find it or create it
            let folder_id = match folder_cache.get(&folder_path_string) {
                // Cache hit
                Some(id) => *id,
                // Cache miss
                None => {
                    //Check if the folder already exists in the relative folder
                    let exists = state
                        .folder_service
                        .check_folder_exists_by_name(&path_segment, user_id, relative_parent_folder)
                        .await?;

                    // Return the folder id if it exists
                    let new_folder_id = if exists.is_some() {
                        exists.unwrap()
                    } else {
                        //Create folder if not exists and return the new folder id
                        state
                            .folder_service
                            .create_folder(user_id, path_segment, relative_parent_folder)
                            .await?
                    };
                    // Cache folder id
                    folder_cache.insert(folder_path_string.clone(), new_folder_id);

                    new_folder_id
                }
            };
            relative_parent_folder = Some(folder_id);
        }

        let id = state.sf.next_id().map_err(|_| AppError::InternalError)? as i64;
        let ct = field.content_type().unwrap().to_string();
        let mut file_type = FileService::get_file_type(&ct);

        let exists = state
            .file_service
            .check_file_exists_by_name(&file_name, user_id, relative_parent_folder)
            .await?;

        if let Some(file) = exists {
            state
                .image_service
                .delete_formats_from_file_id(file)
                .await?;
            state.file_service.permanently_delete_file(file).await?;

            tracing::info!("File {} deleted for replacement {}", file, id);
        }

        match stream_to_file(&location, &id.to_string(), field).await {
            Ok(len) => {
                if file_type == FileType::Image {
                    if len > FILE_SIZE_LIMIT {
                        file_type = FileType::LargeImage;
                    }
                }

                state
                    .file_service
                    .create_file(
                        user_id,
                        id,
                        file_name,
                        len as i64,
                        file_type,
                        ct,
                        relative_parent_folder,
                    )
                    .await?;

                if file_type == FileType::Image {
                    pending_image_formats.push(id);
                }
            }
            Err(err) => {
                tracing::error!("Error uploading file {}: {}", id, err);
                return Err(AppError::InternalError);
            }
        };
    }

    println!("Pending {}", pending_image_formats.len());

    if !pending_image_formats.is_empty() {
        let image_service_clone = state.image_service.clone();
        println!("Generating {} formats", pending_image_formats.len());
        IMAGE_PROCESSING_RUNTIME.spawn(async move {
            let _ = image_service_clone
                .generate_all_formats(pending_image_formats)
                .await;
        });
    }

    Ok(AppSuccess::OK { data: None })
}

#[derive(Deserialize, Validate)]
pub struct RenameParams {
    #[validate(length(min = 1, message = "Name cannot be empty"))]
    pub name: String,
}

pub async fn rename_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
    Valid(Json(params)): Valid<Json<RenameParams>>,
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
