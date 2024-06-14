use crate::model::file::FileType;
use crate::model::image::ImageFormat;
use crate::model::operation::OperationStatus;
use axum::extract::{Path, State};
use axum::response::{IntoResponse, Response};
use std::path::Path as StdPath;
use std::sync::Arc;
use tower_sessions::Session;

use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::runtimes::IMAGE_PROCESSING_RUNTIME;
use crate::services::file_service::FileService;
use crate::services::image_service::ImageService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn get_image_by_format(
    State(state): KosmosState,
    session: Session,
    Path((file_id, format)): Path<(i64, i16)>,
) -> Result<Response, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let file_data = state
        .file_service
        .check_file_exists_by_id(file_id, user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "File not found".to_string(),
        })?;

    let file_type = FileService::get_file_type(&file_data.mime_type);

    if file_type != FileType::Image && file_type != FileType::RawImage {
        return Err(AppError::BadRequest {
            error: Some("File is not an image".to_string()),
        });
    }

    let image_format_id = ImageFormat::get_id_by_format(ImageFormat::get_format_by_id(format));

    // Check that the file exists on disk
    let upload_location = std::env::var("UPLOAD_LOCATION").unwrap();

    let file_should_have_formats =
        FileType::get_type_by_id(file_data.file_type) != FileType::RawImage;

    let format_path =
        if file_should_have_formats {
            StdPath::new(&upload_location).join("formats").join(
                ImageService::make_image_format_name(file_data.id, image_format_id),
            )
        } else {
            StdPath::new(&upload_location).join(file_data.id.to_string())
        };

    if !format_path.exists() {
        return Err(AppError::NotFound {
            error: "Format not found".to_string(),
        });
    }

    let image = tokio::fs::read(format_path).await.map_err(|e| {
        tracing::error!("Error reading image file: {}", e);
        AppError::InternalError
    })?;

    let headers = if file_should_have_formats {
        [("Content-Type", "image/jpeg")]
    } else {
        [("Content-Type", file_data.mime_type.as_str())]
    };

    Ok((headers, image).into_response())
}

pub async fn reprocess_images_from_operation(
    State(state): KosmosState,
    session: Session,
    Path(operation_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let operation = state
        .operation_service
        .get_operation_for_user_by_id(operation_id, user_id)
        .await?;

    let operation_status = OperationStatus::get_status_by_id(operation.operation_status);

    if operation_status == OperationStatus::Unrecoverable {
        return Err(AppError::BadRequest {
            error: Some("Operation is unrecoverable".to_string()),
        })?;
    }

    if operation_status != OperationStatus::Interrupted
        && operation_status != OperationStatus::Failed
    {
        return Err(AppError::BadRequest {
            error: Some("Operation is not in an error state".to_string()),
        })?;
    };

    let metadata = match operation.metadata {
        None => Err(AppError::BadRequest {
            error: Some("Operation has no metadata".to_string()),
        })?,
        Some(data) => {
            let data: Vec<i64> = serde_json::from_value(data).map_err(|e| {
                tracing::error!("Error parsing metadata: {}", e);
                AppError::InternalError
            })?;

            data
        }
    };

    if !metadata.is_empty() {
        let image_service_clone = state.image_service.clone();

        IMAGE_PROCESSING_RUNTIME.spawn(async move {
            let _ = image_service_clone
                .generate_all_formats(
                    metadata,
                    user_id.clone(),
                    Arc::new(state.operation_service.clone()),
                    Some(operation.id),
                )
                .await;
        });
    }

    Ok(AppSuccess::OK { data: None })
}
