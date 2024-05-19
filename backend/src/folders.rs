use std::path::Path;
use tokio::fs::{create_dir, create_dir_all};

pub async fn init() {
    let path = std::env::var("UPLOAD_LOCATION").unwrap();
    let upload_location = Path::new(&path).join("formats");

    if !Path::new(&path).exists() {
        tracing::info!(name: "bootstrap", "Creating upload location: {}", path);
        create_dir(&path).await.unwrap()
    }

    if !upload_location.exists() {
        tracing::info!(name: "bootstrap", "Creating formats folder");
        create_dir_all(&upload_location).await.unwrap();
    }

    tracing::info!(name: "bootstrap", "Folders initialized");
}
