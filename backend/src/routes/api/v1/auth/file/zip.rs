use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use serde::Serialize;
use std::fs::File;
use tokio::task::spawn_blocking;
use tower_sessions::Session;
use zip::ZipArchive;

#[derive(Serialize)]
pub struct ZipInformation {
    pub name: String,
    pub folders: Vec<ZipInformation>,
    pub files: Vec<String>,
}

impl ZipInformation {
    fn new(name: &str) -> Self {
        ZipInformation {
            name: name.to_string(),
            folders: Vec::new(),
            files: Vec::new(),
        }
    }

    fn add_path(&mut self, path_parts: &[&str]) {
        if path_parts.is_empty() {
            return;
        }

        if path_parts.len() == 1 {
            if path_parts[0].is_empty() {
                return;
            }
            self.files.push(path_parts[0].to_string());
        } else {
            let folder_name = path_parts[0];
            let folder = self.folders.iter_mut().find(|f| f.name == folder_name);

            let folder = match folder {
                Some(f) => f,
                None => {
                    self.folders.push(ZipInformation::new(folder_name));
                    self.folders.last_mut().unwrap()
                }
            };

            folder.add_path(&path_parts[1..]);
        }
    }
}

fn build_zip_information(paths: Vec<String>) -> ZipInformation {
    let mut root = ZipInformation::new("root");

    for path in paths {
        let parts: Vec<&str> = path.split('/').collect();
        root.add_path(&parts);
    }

    root
}

pub async fn get_zip_information(
    State(state): KosmosState,
    session: Session,
    Path(file_id): Path<i64>,
) -> Result<Json<ZipInformation>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;
    let file_model = state.file_service.get_file(file_id, Some(user_id)).await?;

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

    Ok(Json(zip_info))
}
