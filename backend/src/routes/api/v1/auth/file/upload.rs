use futures::{Stream, TryStreamExt};
use axum::body::Bytes;
use axum::BoxError;
use std::io;
use tokio_util::io::StreamReader;
use tokio::io::BufWriter;
use tokio::fs::File;
use axum::extract::{Multipart, Path, State};
use tower_sessions::Session;
use axum::extract::rejection::PathRejection;
use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use crate::model::internal::preview_status::PreviewStatus;
use crate::model::internal::file_type::FileType;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::auth::file::index::FILE_SIZE_LIMIT;
use crate::runtimes::IMAGE_PROCESSING_RUNTIME;
use crate::services::file_service::FileService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn upload_file(
    State(state): KosmosState,
    session: Session,
    folder_id: Result<Path<i64>, PathRejection>,
    mut multipart: Multipart,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let folder = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };

    let user = state
        .user_service
        .get_auth_user(user_id)
        .await?;

    let storage_used = state
        .usage_service
        .get_user_storage_usage(user_id, None)
        .await?.get_sum();

    let mut storage_remaining = user.storage_limit - storage_used;

    if storage_remaining < 0 {
        return Err(AppError::BadRequest {
            error: Some("Storage limit exceeded".to_string()),
        });
    }

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
        let mut file_type_res = FileService::get_file_type(&ct, &file_name);

        let exists = state
            .file_service
            .check_file_exists_by_name(&file_name, user_id, relative_parent_folder)
            .await?;

        if let Some(file) = exists {
            state
                .file_service
                .permanently_delete_file(file, None)
                .await?;

            tracing::info!("File {} deleted for replacement {}", file, id);
        }

        match stream_to_file(&location, &id.to_string(), field).await {
            Ok(len) => {
                storage_remaining -= len as i64;

                if storage_remaining < 0 {
                    return Err(AppError::BadRequest {
                        error: Some("Storage limit exceeded".to_string()),
                    })?;
                }

                if file_type_res.file_type == FileType::Image {
                    if len > FILE_SIZE_LIMIT {
                        file_type_res.file_type = FileType::LargeImage;
                    }
                }

                state
                    .file_service
                    .create_file(
                        user_id,
                        id,
                        file_name,
                        len as i64,
                        file_type_res.file_type,
                        file_type_res.normalized_mime_type,
                        relative_parent_folder,
                    )
                    .await?;

                if file_type_res.file_type == FileType::Image {
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

        state
            .file_service
            .update_preview_status_for_file_ids(&pending_image_formats, PreviewStatus::Processing)
            .await?;

        IMAGE_PROCESSING_RUNTIME.spawn(async move {
            let _ = image_service_clone
                .generate_all_formats(
                    pending_image_formats,
                    user_id.clone(),
                    Arc::new(state.clone()),
                    None,
                )
                .await;
        });
    }

    Ok(AppSuccess::OK { data: None })
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