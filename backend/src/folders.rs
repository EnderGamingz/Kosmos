use std::path::Path;
use tokio::fs::{create_dir, create_dir_all};

pub async fn init() {
    let path = std::env::var("UPLOAD_LOCATION").unwrap();
    let upload_location = Path::new(&path).join("formats");
    let temp_location = Path::new(&path).join("temp");

    if !Path::new(&path).exists() {
        tracing::info!(name: "bootstrap", "Creating upload location: {}", path);
        create_dir(&path).await.unwrap()
    }

    if !upload_location.exists() {
        tracing::info!(name: "bootstrap", "Creating formats folder");
        create_dir_all(&upload_location).await.unwrap();
    }

    if !temp_location.exists() {
        tracing::info!(name: "bootstrap", "Creating temp folder");
        create_dir_all(&temp_location).await.unwrap();
    }

    tracing::info!(name: "bootstrap", "Folders initialized");
}
