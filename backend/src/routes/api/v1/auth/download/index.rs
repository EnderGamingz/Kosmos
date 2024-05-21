use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::body::Body;
use axum::extract::{Path, State};
use axum::http::header;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Deserialize;
use std::io::{BufWriter, Write};
use tokio::fs::File;
use tokio::io::AsyncReadExt;
use tokio_util::io::ReaderStream;
use tower_sessions::Session;
use zip::write::{FileOptions, SimpleFileOptions};
use zip::ZipWriter;

pub async fn download_raw_file(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> Result<Response, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let file = state
        .file_service
        .check_file_exists_by_id(file_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    let file_path =
        std::path::Path::new(&std::env::var("UPLOAD_LOCATION").unwrap()).join(file.id.to_string());
    let system_file = File::open(file_path)
        .await
        .map_err(|_| AppError::NotFound {
            error: "File to download not found".to_string(),
        })?;

    let metadata = system_file
        .metadata()
        .await
        .map_err(|_| AppError::NotFound {
            error: "File to download not found".to_string(),
        })?;

    let stream = ReaderStream::new(system_file);

    let body = Body::from_stream(stream);

    let headers = [
        (header::CONTENT_LENGTH, metadata.len().to_string()),
        (
            header::CONTENT_TYPE,
            format!("{}; charset=utf-8", file.mime_type),
        ),
        (
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}\"", file.file_name),
        ),
        (header::ETAG, format!("\"{}\"", file.id)),
        (header::CACHE_CONTROL, "no-cache".to_string()),
        (header::PRAGMA, "no-cache".to_string()),
        (header::LAST_MODIFIED, file.updated_at.to_rfc3339()),
    ];

    Ok((headers, body).into_response())
}

#[derive(Deserialize)]
pub struct MultiDownloadRequest {
    pub files: Vec<String>,
    pub folders: Vec<String>,
}

pub struct MultiDownloadParsed {
    pub files: Vec<i64>,
    pub folders: Vec<i64>,
}

pub async fn multi_download(
    State(state): KosmosState,
    session: Session,
    Json(request_data): Json<MultiDownloadRequest>,
) -> Result<Response, AppError> {
    let request = MultiDownloadParsed {
        files: request_data
            .files
            .iter()
            .map(|x| x.parse::<i64>())
            .collect::<Result<Vec<i64>, _>>()
            .map_err(|_| AppError::UnprocessableEntity {
                error: "Invalid file id".to_string(),
            })?,
        folders: request_data
            .folders
            .iter()
            .map(|x| x.parse::<i64>())
            .collect::<Result<Vec<i64>, _>>()
            .map_err(|_| AppError::UnprocessableEntity {
                error: "Invalid folder id".to_string(),
            })?,
    };

    let user_id = SessionService::check_logged_in(&session).await?;
    let upload_location = std::env::var("UPLOAD_LOCATION").unwrap();
    let upload_path = std::path::Path::new(&upload_location);

    let folder_structure = state
        .folder_service
        .get_folder_structure(request.folders, user_id)
        .await?;

    const TEMP_FILE: &str = "temp.zip";

    let _ = tokio::fs::remove_file(TEMP_FILE).await;

    let file = std::fs::File::create(TEMP_FILE).map_err(|e| {
        tracing::error!("Error creating zip file: {}", e);
        AppError::InternalError
    })?;

    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);
    let mut writer = BufWriter::new(&file);
    let mut zip = ZipWriter::new(&mut writer);

    for file_id in request.files {
        let database_file = state
            .file_service
            .check_file_exists_by_id(file_id, user_id)
            .await?
            .ok_or(AppError::NotFound {
                error: "File not found".to_string(),
            })?;

        let path_to_file = upload_path.join(database_file.id.to_string());

        if let Ok(mut file) = File::open(&path_to_file).await {
            write_file_to_zip(options, &mut zip, &database_file.file_name, &mut file).await?;
        }
    }

    for dir in &folder_structure {
        let mut dir_paths = vec![];
        dir_paths.push((&dir.path.join("/")).to_owned());
        dir_paths.push((&dir.folder_name).to_owned());

        let path_in_zip = dir_paths.join("/");

        for i in 0..dir.files.len() {
            let file_id: &i64 = &dir.files[i];
            let file_name: &String = &dir.file_names[i];

            let path_to_file = upload_path.join(file_id.to_string());

            if let Ok(mut file) = File::open(&path_to_file).await {
                zip.add_directory(&path_in_zip, options).map_err(|e| {
                    tracing::error!("Error adding directory to zip: {}", e);
                    AppError::InternalError
                })?;

                let file_in_zip = format!("{}/{}", path_in_zip, file_name);

                write_file_to_zip(options, &mut zip, &file_in_zip, &mut file).await?;
            } else {
                return Err(AppError::NotFound {
                    error: "File not found".to_string(),
                });
            }
        }
    }

    zip.finish().map_err(|e| {
        tracing::error!("Error finishing zip: {}", e);
        AppError::InternalError
    })?;

    writer.flush().map_err(|e| {
        tracing::error!("Error flushing zip data to file: {}", e);
        AppError::InternalError
    })?;

    let data = File::open("temp.zip").await.map_err(|e| {
        tracing::error!("Error reading zip file: {}", e);
        AppError::InternalError
    })?;

    let meta_data = data.metadata().await.map_err(|e| {
        tracing::error!("Error getting metadata of zip file: {}", e);
        AppError::InternalError
    })?;

    let stream = ReaderStream::new(data);
    let body = Body::from_stream(stream);

    let header = [
        (header::CONTENT_TYPE, "application/zip".to_string()),
        (header::CONTENT_LENGTH, meta_data.len().to_string()),
    ];
    let response: Result<Response<Body>, AppError> = Ok((header, body).into_response());

    let _ = tokio::fs::remove_file(TEMP_FILE).await;
    response
}

async fn write_file_to_zip(
    options: FileOptions<'_, ()>,
    zip: &mut ZipWriter<&mut BufWriter<&std::fs::File>>,
    file_name: &str,
    file: &mut File,
) -> Result<(), AppError> {
    zip.start_file(file_name, options).map_err(|e| {
        tracing::error!("Error adding file to zip: {}", e);
        AppError::InternalError
    })?;
    let mut buffer = vec![0; 1024];
    while let Ok(n) = file.read(&mut buffer).await {
        if n == 0 {
            break;
        }
        zip.write_all(&buffer[..n]).map_err(|e| {
            tracing::error!("Error writing file to zip: {}", e);
            AppError::InternalError
        })?;
    }
    Ok(())
}
