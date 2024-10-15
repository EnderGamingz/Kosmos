use crate::model::file::FileModel;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::{AppState, KosmosState};
use axum::extract::{Path, State};
use axum::Json;
use std::fs::File;
use tokio::task::spawn_blocking;
use tower_sessions::Session;
use zip::ZipArchive;
use crate::model::internal::zip::ZipInformation;
use crate::routes::api::v1::share::{get_share_file, is_allowed_to_access_share};

fn build_zip_information(paths: Vec<String>) -> ZipInformation {
    let mut root = ZipInformation::new("root");

    for path in paths {
        let parts: Vec<&str> = path.split('/').collect();
        root.add_path(&parts);
    }

    root
}

pub async fn get_zip_information_for_file(
    state: AppState,
    file_model: FileModel,
) -> Result<ZipInformation, AppError> {
    if !file_model.file_type.is_archive() && !file_model.file_name.ends_with(".zip") {
        return Err(AppError::BadRequest {
            error: Some("File is not an zip file".to_string()),
        });
    };

    let file = spawn_blocking(move || {
        File::open(
            state
                .file_service
                .upload_path
                .join(file_model.id.to_string()),
        )
            .map_err(|e| {
                tracing::error!("Error while loading file {}: {}", file_model.id, e);
                AppError::InternalError
            })
    })
        .await
        .map_err(|_| AppError::InternalError)??;

    let mut archive = ZipArchive::new(file).map_err(|e| {
        tracing::error!(
            "Error while loading file as archive {}: {}",
            file_model.id,
            e
        );
        AppError::InternalError
    })?;

    let mut files_strings: Vec<String> = Vec::new();

    for i in 0..archive.len() {
        if let Ok(file) = archive.by_index(i) {
            let name = file.name().trim_start_matches('/').to_string();
            files_strings.push(name);
        }
    }

    let zip_info = build_zip_information(files_strings);
    Ok(zip_info)
}

pub async fn get_zip_information(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> Result<Json<ZipInformation>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let file_model = state.file_service.get_file(file_id, Some(user_id)).await?;

    let zip_info = get_zip_information_for_file(state, file_model).await?;

    Ok(Json(zip_info))
}

pub async fn access_zip_share(
    State(state): KosmosState,
    session: Session,
    Path(share_uuid): Path<String>,
) -> Result<Json<ZipInformation>, AppError> {
    let share = is_allowed_to_access_share(&state, &session, share_uuid, false).await?;

    let share_file = get_share_file(&state, share.file_id).await?;
    let _ = state.share_service.handle_share_access(share.id).await;

    let zip_info = get_zip_information_for_file(state, share_file.file).await?;

    Ok(Json(zip_info))
}
