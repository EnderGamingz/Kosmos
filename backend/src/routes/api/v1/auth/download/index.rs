use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::body::Body;
use axum::extract::{Path, State};
use axum::http::header;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Deserialize;
use std::io::{Cursor, Write};
use tokio::fs::File;
use tokio::io::AsyncReadExt;
use tokio_util::io::ReaderStream;
use tower_sessions::Session;
use zip::write::SimpleFileOptions;
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
pub struct MultiDownloadResponse {
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
    Json(request_data): Json<MultiDownloadResponse>,
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

    let buf = Cursor::new(Vec::new());
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);
    let mut zip = ZipWriter::new(buf);

    for dir in &folder_structure {
        for i in 0..dir.files.len() {
            let file_id: &i64 = &dir.files[i];
            let file_name: &String = &dir.file_names[i];

            let path_to_file = upload_path.join(file_id.to_string());

            if let Ok(mut file) = File::open(&path_to_file).await {
                let mut dir_paths = vec![];
                dir_paths.push((&dir.path.join("/")).to_owned());
                dir_paths.push((&dir.folder_name).to_owned());

                let path_in_zip = dir_paths.join("/");

                zip.add_directory(&path_in_zip, options).map_err(|e| {
                    tracing::error!("Error adding directory to zip: {}", e);
                    AppError::InternalError
                })?;

                let file_in_zip = format!("{}/{}", path_in_zip, file_name);
                zip.start_file(&*file_in_zip, options).map_err(|e| {
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
            } else {
                return Err(AppError::NotFound {
                    error: "File not found".to_string(),
                });
            }
        }
    }

    let result: Cursor<Vec<u8>> = zip.finish().map_err(|e| {
        tracing::error!("Error finishing zip: {}", e);
        AppError::InternalError
    })?;

    let data = result.into_inner();

    let body = Body::from(data);

    let header = [(header::CONTENT_TYPE, "application/zip")];
    Ok((header, body).into_response())
}
