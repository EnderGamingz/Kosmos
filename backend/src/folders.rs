use std::path::Path;
use tokio::fs::{create_dir, create_dir_all};

pub async fn init() {
    let backup_location = Path::new("backup");

    let upload_path = std::env::var("UPLOAD_LOCATION")
        .expect("UPLOAD_LOCATION must be set");
    let upload_location = Path::new(&upload_path).join("formats");
    let temp_location = Path::new(&upload_path).join("temp");

    if !Path::new(&upload_path).exists() {
        tracing::info!(name: "bootstrap", "Creating upload location: {}", upload_path);
        create_dir(&upload_path)
            .await
            .expect("Could not create upload location");
    }

    if !upload_location.exists() {
        tracing::info!(name: "bootstrap", "Creating formats folder");
        create_dir_all(&upload_location)
            .await
            .expect("Could not create formats folder");
    }

    if !temp_location.exists() {
        tracing::info!(name: "bootstrap", "Creating temp folder");
        create_dir_all(&temp_location)
            .await
            .expect("Could not create temp folder");
    }

    if !backup_location.exists() {
        tracing::info!(name: "bootstrap", "Creating backup folder");
        create_dir_all(&backup_location)
            .await
            .expect("Could not create backup folder");
    }

    tracing::info!(name: "bootstrap", "Folders initialized");
}
