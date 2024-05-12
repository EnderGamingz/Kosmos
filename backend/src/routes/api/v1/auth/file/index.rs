use std::io;

use crate::model::file::FileModel;
use axum::body::Bytes;
use axum::extract::{Multipart, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{BoxError, Json};
use futures::{Stream, TryStreamExt};
use tokio::fs::File;
use tokio::io::BufWriter;
use tokio_util::io::StreamReader;
use tower_sessions::Session;

use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::file_service::FileService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn get_files(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let files = state.file_service.get_files(user_id, None).await?;

    Ok(Json(serde_json::json!(files)))
}

pub async fn upload_file(
    State(state): KosmosState,
    session: Session,
    mut multipart: Multipart,
) -> ResponseResult {
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
            .check_file_exists(&file_name, user_id, None)
            .await?;

        if let Some(file) = exists {
            state.file_service.delete_file(file).await?;
            tracing::info!("File {} deleted for replacement {}", file, id);
        }

        match stream_to_file(&location, &id.to_string(), field).await {
            Ok(len) => {
                state
                    .file_service
                    .create_file(user_id, id, file_name, len as i64, file_type, ct)
                    .await?;
            }
            Err(err) => {
                tracing::error!("{}", err);
                return Err(AppError::InternalError);
            }
        };
    }

    Ok(AppSuccess::OK {
        data: Some(serde_json::to_string("test").unwrap()),
    })
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
                tracing::error!("{}", e);
                let _ = tokio::fs::remove_file(&path).await;
                return Err(e);
            }
            Ok(len) => Ok(len),
        }
    }
    .await
    .map_err(|err| err.to_string())
}
