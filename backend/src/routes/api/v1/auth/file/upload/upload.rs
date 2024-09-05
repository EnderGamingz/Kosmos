use crate::model::internal::file_type::FileType;
use crate::model::internal::preview_status::PreviewStatus;
use crate::response::error_handling::AppError;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::routes::api::v1::auth::file::index::FILE_SIZE_LIMIT;
use crate::routes::api::v1::auth::file::upload::{
    check_storage, folder_segments, quick_share_destination, stream,
};
use crate::routes::api::v1::share::create::ShareFolderPublicRequest;
use crate::runtimes::IMAGE_PROCESSING_RUNTIME;
use crate::services::file_service::FileService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use crate::utils::auth;
use axum::extract::rejection::PathRejection;
use axum::extract::{Multipart, Path, Query, State};
use serde::Deserialize;
use std::collections::HashMap;
use std::str::FromStr;
use std::sync::Arc;
use chrono::{DateTime, Utc};
use tower_sessions::Session;

#[derive(Deserialize)]
pub struct FileUploadParams {
    pub is_quick_share: Option<bool>,
    pub limit: Option<i32>,
    pub password: Option<String>,
    pub expires_at: Option<String>,
}

impl FileUploadParams {
    pub fn is_quick_share(&self) -> bool {
        self.is_quick_share.unwrap_or(false)
    }

    pub fn get_hash(&self) -> Result<Option<String>, AppError> {
        if let Some(password) = &self.password {
            let hashed_password = auth::hash_password(password.as_str())?;

            Ok(Some(hashed_password))
        } else {
            Ok(None)
        }
    }

    pub fn get_expiry(&self) -> Result<Option<DateTime<Utc>>, AppError> {
        if let Some(expires_at) = &self.expires_at {
            let expiry = DateTime::<Utc>::from_str(expires_at.as_str())
                .map_err(|e| {
                    tracing::error!("Error parsing expiry: {}", e);
                    AppError::InternalError
                })?
                .with_timezone(&Utc);
            Ok(Some(expiry))
        } else {
            Ok(None)
        }
    }
}

pub async fn upload_file(
    State(state): KosmosState,
    session: Session,
    Query(params): Query<FileUploadParams>,
    folder_id: Result<Path<i64>, PathRejection>,
    mut multipart: Multipart,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;
    let folder = match folder_id {
        Ok(Path(id)) => Some(id),
        Err(_) => None,
    };

    let user = state.user_service.get_auth_user(user_id).await?;

    let mut storage_remaining =
        check_storage::check_user_storage_limit(&state.usage_service, user.id, user.storage_limit)
            .await?;

    let location = std::env::var("UPLOAD_LOCATION").map_err(|e| {
        tracing::error!("Error getting upload location: {}", e);
        AppError::InternalError
    })?;

    let mut folder_cache: HashMap<String, i64> = HashMap::new();
    let mut pending_image_formats: Vec<i64> = Vec::new();

    let quick_share_destination = if params.is_quick_share() {
        Some(
            quick_share_destination::handle_quick_share_destination(&state.folder_service, user.id)
                .await?,
        )
    } else {
        None
    };

    while let Ok(Some(field)) = multipart.next_field().await {
        let file_name_from_field = if let Some(file_name) = field.file_name() {
            if file_name.len() > 255 {
                return Err(AppError::BadRequest {
                    error: Some("File name is too long".to_string()),
                });
            }
            file_name.to_owned()
        } else {
            continue;
        };

        let (file_name, relative_parent_folder) = match quick_share_destination {
            None => {
                folder_segments::process_folder_segments(
                    &state,
                    user.id,
                    folder,
                    &mut folder_cache,
                    file_name_from_field,
                )
                .await?
            }
            Some(dest) => (file_name_from_field, Some(dest)),
        };

        let id = state.get_safe_id()?;

        let ct = field
            .content_type()
            .unwrap_or("application/octet-stream")
            .to_string();

        let mut file_type_res = FileService::get_file_type(&ct, &file_name);

        let exists = state
            .file_service
            .check_file_exists_by_name(&file_name, user.id, relative_parent_folder)
            .await?;

        if let Some(file) = exists {
            state
                .file_service
                .permanently_delete_file(file, None)
                .await?;

            tracing::info!(
                "File {} deleted for replacement {} for user {}",
                file,
                id,
                user.id
            );
        }

        match stream::stream_to_file(&location, &id.to_string(), field).await {
            Ok(len) => {
                storage_remaining -= len as i64;

                if storage_remaining < 0 {
                    return Err(AppError::BadRequest {
                        error: Some("Storage limit exceeded".to_string()),
                    })?;
                }

                if file_type_res.file_type == FileType::Image && len > FILE_SIZE_LIMIT {
                    file_type_res.file_type = FileType::LargeImage;
                }

                state
                    .file_service
                    .create_file(
                        user.id,
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

    let share = if let Some(dest) = quick_share_destination {
        let data = ShareFolderPublicRequest {
            folder_id: dest.to_string(),
            password: params.get_hash()?,
            limit: params.limit,
            expires_at: params.get_expiry()?,
        };
        Some(
            state
                .share_service
                .create_public_folder_share(dest, data, user.id)
                .await?,
        )
    } else {
        None
    };

    tracing::debug!("Pending {}", pending_image_formats.len());

    if !pending_image_formats.is_empty() {
        let image_service_clone = state.image_service.clone();
        tracing::debug!("Generating {} formats", pending_image_formats.len());

        state
            .file_service
            .update_preview_status_for_file_ids(&pending_image_formats, PreviewStatus::Processing)
            .await?;

        IMAGE_PROCESSING_RUNTIME.spawn(async move {
            let _ = image_service_clone
                .generate_all_formats(
                    pending_image_formats,
                    user.id,
                    Arc::new(state.clone()),
                    None,
                )
                .await;
        });
    }

    Ok(AppSuccess::OK {
        data: share.map(|s| s.uuid.to_string()),
    })
}
