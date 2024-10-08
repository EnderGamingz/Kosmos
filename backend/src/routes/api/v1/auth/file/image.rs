use crate::model::file::FileModel;
use crate::model::internal::image_format::ImageFormat;
use crate::model::internal::operation_status::OperationStatus;
use axum::extract::{Path, State};
use axum::response::{IntoResponse, Response};
use std::path::Path as StdPath;
use std::sync::Arc;
use tower_sessions::Session;
use crate::model::internal::file_type::FileType;
use crate::model::internal::preview_status::PreviewStatus;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::share::{
    get_share_access_for_folder_items, get_share_album_data, get_share_file,
    is_allowed_to_access_share, AccessShareItemType,
};
use crate::runtimes::IMAGE_PROCESSING_RUNTIME;
use crate::services::file_service::FileService;
use crate::services::image_service::ImageService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

async fn get_image_format_data(
    format: ImageFormat,
    file_data: &FileModel,
) -> Result<(Vec<u8>, [(&str, &str); 1]), AppError> {
    let file_type_res = FileService::get_file_type(&file_data.mime_type, &file_data.file_name);

    if file_type_res.file_type != FileType::Image && file_type_res.file_type != FileType::RawImage {
        return Err(AppError::BadRequest {
            error: Some("File is not an image".to_string()),
        });
    }

    // Check that the file exists on disk
    let upload_location = std::env::var("UPLOAD_LOCATION").unwrap();

    let file_should_have_formats = file_data.file_type != FileType::RawImage;

    let format_path = if file_should_have_formats {
        StdPath::new(&upload_location)
            .join("formats")
            .join(ImageService::make_image_format_name(file_data.id, format))
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
    Ok((image, headers))
}

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

    let format = ImageFormat::format_by_id_save(format)?;

    let (image, headers) = get_image_format_data(format, &file_data).await?;

    Ok((headers, image).into_response())
}

pub async fn get_share_image_by_format_through_folder(
    State(state): KosmosState,
    session: Session,
    Path((share_uuid, file_id, format)): Path<(String, i64, i16)>,
) -> Result<Response, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid.clone(), false).await?;
    let can_access_with_share =
        get_share_access_for_folder_items(&state, &AccessShareItemType::File, file_id, &share)
            .await?;

    if !can_access_with_share {
        return Err(AppError::NotAllowed {
            error: "Not allowed".to_string(),
        })?;
    }

    let share_file_data = get_share_file(&state, Some(file_id)).await?;
    let format = ImageFormat::format_by_id_save(format)?;

    let (image, headers) = get_image_format_data(format, &share_file_data.file).await?;

    Ok((headers, image).into_response())
}

pub async fn get_share_image_by_format_through_album(
    State(state): KosmosState,
    session: Session,
    Path((share_uuid, file_id, format)): Path<(String, i64, i16)>,
) -> Result<Response, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid.clone(), true).await?;
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

    let file = state.file_service.get_file(file_id, None).await?;
    let format = ImageFormat::format_by_id_save(format)?;

    let (image, headers) = get_image_format_data(format, &file).await?;

    Ok((headers, image).into_response())
}

pub async fn get_share_image_by_format(
    State(state): KosmosState,
    session: Session,
    Path((share_uuid, format)): Path<(String, i16)>,
) -> Result<Response, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid.clone(), false).await?;
    let share_file_data = get_share_file(&state, share.file_id).await?;
    let format = ImageFormat::format_by_id_save(format)?;

    let (image, headers) = get_image_format_data(format, &share_file_data.file).await?;

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


    if operation.operation_status == OperationStatus::Unrecoverable {
        return Err(AppError::BadRequest {
            error: Some("Operation is unrecoverable".to_string()),
        })?;
    }

    if operation.operation_status != OperationStatus::Interrupted
        && operation.operation_status != OperationStatus::Failed
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

        state
            .file_service
            .update_preview_status_for_file_ids(&metadata, PreviewStatus::Processing)
            .await?;

        IMAGE_PROCESSING_RUNTIME.spawn(async move {
            let _ = image_service_clone
                .generate_all_formats(
                    metadata,
                    user_id.clone(),
                    Arc::new(state.clone()),
                    Some(operation.id),
                )
                .await;
        });
    }

    Ok(AppSuccess::OK { data: None })
}
