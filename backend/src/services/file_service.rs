use std::path::Path;

use sonyflake::Sonyflake;

use crate::db::KosmosPool;
use crate::model::file::FileType;
use crate::response::error_handling::AppError;
use crate::services::session_service::UserId;

#[derive(Clone)]
pub struct FileService {
    db_pool: KosmosPool,
    sf: Sonyflake,
}

impl FileService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        FileService { db_pool, sf }
    }

    pub async fn create_file(
        &self,
        user_id: UserId,
        file_id: i64,
        file_name: String,
        file_size: i64,
        file_type: FileType,
        mime_type: String,
    ) -> Result<i64, AppError> {
        sqlx::query!(
            "INSERT INTO files (id, user_id, file_name, file_size, file_type, mime_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            file_id,
            user_id,
            file_name,
            file_size,
            file_type as i16,
            mime_type
        )
            .fetch_one(&self.db_pool)
            .await
            .map_err(|_| AppError::InternalError)
            .map(|row| row.id)
    }

    pub async fn check_file_exists(
        &self,
        file_name: &String,
        user_id: UserId,
        parent_folder_id: Option<i64>,
    ) -> Result<Option<i64>, AppError> {
        let result = sqlx::query!(
            "SELECT id FROM files WHERE file_name = $1 AND user_id = $2 AND parent_folder_id IS NOT DISTINCT FROM $3 LIMIT 1",
            file_name,
            user_id,
            parent_folder_id
        )
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|_| {
                tracing::error!("Error checking if file exists: {}", file_name);
                AppError::InternalError
            })?
            .map(|row| row.id);
        Ok(result)
    }

    pub async fn delete_file(&self, file_id: i64) -> Result<(), AppError> {
        tokio::fs::remove_file(
            Path::new(std::env::var("UPLOAD_LOCATION").unwrap().as_str()).join(file_id.to_string()),
        )
            .await
            .map_err(|_| {
                tracing::error!("Error deleting file: {}", file_id);
                AppError::InternalError
            })
            .map(|_| ())?;
        sqlx::query!("DELETE FROM files WHERE id = $1", file_id)
            .execute(&self.db_pool)
            .await
            .map_err(|_| AppError::InternalError)
            .map(|_| ())
    }

    pub fn get_file_type(mime_type: &str) -> FileType {
        const TYPES: [(&'static str, FileType); 30] = [
            ("image/gif", FileType::Image),
            ("image/jpeg", FileType::Image),
            ("image/png", FileType::Image),
            ("image/svg+xml", FileType::Image),
            ("image/webp", FileType::Image),
            ("image/x-icon", FileType::Image),
            ("video/mp4", FileType::Video),
            ("video/webm", FileType::Video),
            ("video/ogg", FileType::Video),
            ("audio/mpeg", FileType::Audio),
            ("audio/ogg", FileType::Audio),
            ("audio/wav", FileType::Audio),
            ("audio/webm", FileType::Audio),
            ("audio/flac", FileType::Audio),
            ("audio/opus", FileType::Audio),
            ("text/css", FileType::Document),
            ("text/html", FileType::Document),
            ("text/javascript", FileType::Document),
            ("text/plain", FileType::Document),
            ("text/xml", FileType::Document),
            ("application/json", FileType::Document),
            ("application/pdf", FileType::Document),
            ("text/markdown", FileType::Document),
            ("text/x-python", FileType::Document),
            ("text/x-rust", FileType::Document),
            ("text/x-c", FileType::Document),
            ("text/x-java", FileType::Document),
            ("text/x-kotlin", FileType::Document),
            ("text/x-ruby", FileType::Document),
            ("text/x-swift", FileType::Document),
        ];

        TYPES
            .iter()
            .find(|(mime, _)| mime == &mime_type)
            .map(|(_, file_type)| *file_type)
            .unwrap_or(FileType::Generic)
    }
}
