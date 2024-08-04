use std::io::{BufWriter, SeekFrom, Write};
use std::str::FromStr;

use axum::body::Body;
use axum::extract::{Path, State};
use axum::http::header::{CONTENT_LENGTH, CONTENT_RANGE, RANGE};
use axum::http::{header, HeaderMap, HeaderName, HeaderValue, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Deserialize;
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncSeekExt};
use tokio_util::io::ReaderStream;
use tower_sessions::Session;
use zip::write::{FileOptions, SimpleFileOptions};
use zip::ZipWriter;

use crate::model::file::FileModel;
use crate::model::folder::Directory;
use crate::model::share::ExtendedShareModel;
use crate::response::error_handling::AppError;
use crate::routes::api::v1::share::{
    get_share_access_for_folder_items, get_share_album_data, get_share_file,
    is_allowed_to_access_share, AccessShareItemType,
};
use crate::services::session_service::{SessionService, UserId};
use crate::state::{AppState, KosmosState};

#[derive(Deserialize)]
pub enum RawFileAction {
    Download,
    Serve,
}

fn add_header(headers: &mut HeaderMap, header: HeaderName, value: &str) {
    headers.insert(
        header,
        HeaderValue::from_str(value).unwrap_or(HeaderValue::from_str("").unwrap()),
    );
}

pub async fn get_raw_file(
    request_headers: &mut HeaderMap,
    state: &AppState,
    file_id: i64,
    operation_type: RawFileAction,
    user_id: Option<UserId>,
) -> Result<(StatusCode, HeaderMap<HeaderValue>, Body), AppError> {
    let file = match user_id {
        None => {
            // File is not owned by user, accessed through share
            state.file_service.get_file(file_id, None).await?
        }
        Some(user_id) => state
            .file_service
            .check_file_exists_by_id(file_id, user_id)
            .await?
            .ok_or(AppError::NotFound {
                error: "File not found".to_string(),
            })?,
    };

    let file_path =
        std::path::Path::new(&std::env::var("UPLOAD_LOCATION").unwrap()).join(file.id.to_string());

    let mut system_file = File::open(file_path)
        .await
        .map_err(|_| AppError::NotFound {
            error: "File to download not found".to_string(),
        })?;

    let metadata = &system_file
        .metadata()
        .await
        .map_err(|_| AppError::NotFound {
            error: "File to download not found".to_string(),
        })?;

    let disposition = match operation_type {
        RawFileAction::Download => format!("attachment; filename=\"{}\"", file.file_name),
        RawFileAction::Serve => String::from("inline"),
    };

    let mut response_headers = HeaderMap::new();
    add_header(
        &mut response_headers,
        header::CONTENT_TYPE,
        file.mime_type.as_str(),
    );
    add_header(
        &mut response_headers,
        header::CONTENT_DISPOSITION,
        disposition.clone().as_str(),
    );
    add_header(
        &mut response_headers,
        header::ETAG,
        &format!("\"{}\"", file.id),
    );
    add_header(&mut response_headers, header::CACHE_CONTROL, "no-cache");
    add_header(&mut response_headers, header::PRAGMA, "no-cache");
    add_header(
        &mut response_headers,
        header::LAST_MODIFIED,
        file.updated_at.to_rfc3339().as_str(),
    );

    // If Range header is present, try to serve partial content to client
    let body = if let Some(range) = request_headers.get(RANGE) {
        // Parse the range and skip beginning ""bytes="
        let range_str = &range.to_str().unwrap_or("")[6..];
        let ranges: Vec<&str> = range_str.split('-').collect();

        let range_start = u64::from_str(ranges[0]).unwrap_or(0);

        // If end isn't specified, read to the end of the file
        let range_end = if ranges.get(1).is_some() && !ranges[1].is_empty() {
            u64::from_str(ranges[1]).unwrap_or(0)
        } else {
            metadata.len() - 1
        };

        let mut file_slice = vec![0u8; (range_end - range_start + 1) as usize];

        system_file
            .seek(SeekFrom::Start(range_start))
            .await
            .map_err(|e| {
                tracing::error!("Error seeking file: {}", e);
                AppError::InternalError
            })?;

        system_file.read_exact(&mut file_slice).await.map_err(|e| {
            tracing::error!("Error reading file slice: {}", e);
            AppError::InternalError
        })?;

        // Set Content-Range header to response
        let _ = HeaderValue::try_from(format!(
            "bytes {}-{}/{}",
            range_start,
            range_end,
            metadata.len()
        ))
        .map(|value| {
            response_headers.insert(CONTENT_RANGE, value);
        });

        // Set Content-Length header to response
        let _ = HeaderValue::try_from(file_slice.len().to_string()).map(|value| {
            response_headers.insert(CONTENT_LENGTH, value);
        });

        Body::from(file_slice)
    } else {
        response_headers.insert(CONTENT_LENGTH, HeaderValue::from(metadata.len()));
        let stream = ReaderStream::new(system_file);

        Body::from_stream(stream)
    };

    // If Content-Range header is present, return partial content to client
    if response_headers.get(CONTENT_RANGE).is_some() {
        Ok((StatusCode::PARTIAL_CONTENT, response_headers, body))
    } else {
        Ok((StatusCode::OK, response_headers, body))
    }
}

pub async fn handle_raw_file(
    mut headers: HeaderMap,
    State(state): KosmosState,
    session: Session,
    Path((file_id, operation_type)): Path<(i64, RawFileAction)>,
) -> Result<Response, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let raw_response =
        get_raw_file(&mut headers, &state, file_id, operation_type, Some(user_id)).await?;

    Ok(raw_response.into_response())
}

pub async fn handle_raw_file_share(
    mut headers: HeaderMap,
    State(state): KosmosState,
    session: Session,
    Path((share_uuid, operation_type)): Path<(String, RawFileAction)>,
) -> Result<Response, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid.clone(), true).await?;
    let shared_file_data = get_share_file(&state, share.file_id).await?;

    let raw_response = get_raw_file(
        &mut headers,
        &state,
        shared_file_data.file.id,
        operation_type,
        None,
    )
    .await?;

    Ok(raw_response.into_response())
}

pub async fn handle_raw_file_share_through_folder(
    mut headers: HeaderMap,
    State(state): KosmosState,
    session: Session,
    Path((share_uuid, file_id, operation_type)): Path<(String, i64, RawFileAction)>,
) -> Result<Response, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid, true).await?;

    let can_access_with_share =
        get_share_access_for_folder_items(&state, &AccessShareItemType::File, file_id, &share)
            .await?;

    if !can_access_with_share {
        return Err(AppError::NotAllowed {
            error: "Not allowed".to_string(),
        })?;
    }

    let share_file_data = get_share_file(&state, Some(file_id)).await?;
    let raw_response = get_raw_file(
        &mut headers,
        &state,
        share_file_data.file.id,
        operation_type,
        None,
    )
    .await?;

    Ok(raw_response.into_response())
}

pub async fn handle_raw_file_share_through_album(
    mut headers: HeaderMap,
    State(state): KosmosState,
    session: Session,
    Path((share_uuid, file_id, operation_type)): Path<(String, i64, RawFileAction)>,
) -> Result<Response, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid, true).await?;

    let shared_file_data = get_share_album_data(&state, share.album_id).await?;

    if !shared_file_data
        .files
        .iter()
        .any(|f| f.id == file_id.to_string())
    {
        return Err(AppError::NotFound {
            error: "File not Found".to_string(),
        })?;
    }

    let raw_response = get_raw_file(&mut headers, &state, file_id, operation_type, None).await?;

    Ok(raw_response.into_response())
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
    let user_id = SessionService::check_logged_in(&session).await?;
    let request = parse_multi_download_payload(request_data)?;

    let folder_structure = state
        .folder_service
        .get_folder_structure(request.folders, Some(user_id))
        .await?;

    let response =
        handle_multi_download(state, request.files, folder_structure, Some(user_id), None).await;
    response
}

pub async fn multi_share_download(
    State(state): KosmosState,
    session: Session,
    Path(share_uuid): Path<String>,
    Json(request_data): Json<MultiDownloadRequest>,
) -> Result<Response, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid, true).await?;
    let request = parse_multi_download_payload(request_data)?;

    for folder_id in &request.folders {
        let t = state
            .share_service
            .is_folder_existing_under_share(*folder_id, share.id, &state.folder_service)
            .await?;

        if !t {
            return Err(AppError::NotFound {
                error: "Folder not found".to_string(),
            })?;
        }
    }

    let folder_structure = state
        .folder_service
        .get_folder_structure(request.folders, None)
        .await?;

    let response =
        handle_multi_download(state, request.files, folder_structure, None, Some(share)).await;
    response
}

fn parse_multi_download_payload(
    request_data: MultiDownloadRequest,
) -> Result<MultiDownloadParsed, AppError> {
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
    Ok(request)
}

async fn handle_multi_download(
    state: AppState,
    files: Vec<i64>,
    folder_structure: Vec<Directory>,
    user_id: Option<UserId>,
    share: Option<ExtendedShareModel>,
) -> Result<Response, AppError> {
    let upload_location = std::env::var("UPLOAD_LOCATION").unwrap();
    let upload_path = std::path::Path::new(&upload_location);
    let temp_location = std::path::Path::new(&upload_location).join("temp");
    let temp_path = std::path::Path::new(&temp_location);

    let file_name = format!(
        "Kosmos_Archive_{}.zip",
        chrono::Utc::now().format("%Y-%m-%d_%H-%M-%S")
    );
    let temp_zip_path = temp_path.join(&file_name);
    let temp_zip_path_str = temp_zip_path.to_str().unwrap();

    let _ = tokio::fs::remove_file(temp_zip_path_str).await;

    let file = std::fs::File::create(temp_zip_path_str).map_err(|e| {
        tracing::error!("Error creating zip file: {}", e);
        AppError::InternalError
    })?;

    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);
    let mut writer = BufWriter::new(&file);
    let mut zip = ZipWriter::new(&mut writer);

    for file_id in files {
        let database_file = multi_download_get_file(&state, file_id, &user_id, &share)
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
                // Ignore error as this can fail when a folder with the name already exists
                let _ = zip.add_directory(&path_in_zip, options);

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

    let data = File::open(temp_zip_path_str).await.map_err(|e| {
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
        (CONTENT_LENGTH, meta_data.len().to_string()),
        (
            header::CONTENT_DISPOSITION,
            format!("attachment; filename={}", file_name),
        ),
    ];

    // This way of doing it is not ideal, but it seems to work, this can maybe break in the future

    // The tokio remove file function uses the underlying 'unlink' syscall
    // which causes the file to be marked as deleted until no process has any handles for it
    // the stream is closed when the request is finished and the file is deleted

    let response: Result<Response<Body>, AppError> = Ok((header, body).into_response());

    let _ = tokio::fs::remove_file(temp_zip_path_str).await;
    response
}

async fn multi_download_get_file(
    state: &AppState,
    file_id: i64,
    user_id: &Option<UserId>,
    share: &Option<ExtendedShareModel>,
) -> Result<Option<FileModel>, AppError> {
    if let Some(user_id) = user_id {
        return state
            .file_service
            .check_file_exists_by_id(file_id, *user_id)
            .await;
    }

    if let Some(share) = share {
        let can_access_with_share =
            get_share_access_for_folder_items(&state, &AccessShareItemType::File, file_id, share)
                .await?;
        if !can_access_with_share {
            return Err(AppError::NotAllowed {
                error: "Not allowed".to_string(),
            })?;
        }
        let file = state.file_service.get_file(file_id, None).await?;

        return Ok(Some(file));
    }

    return Ok(None);
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
