use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use sqlx::types::JsonValue;

#[repr(i16)]
#[derive(Clone, Copy)]
pub enum FileType {
    Generic = 0,
    Image = 1,
    Video = 2,
    Audio = 3,
    Document = 4,
}

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct FileModel {
    pub id: i64,
    pub user_id: i64,
    pub file_name: String,
    pub file_size: i64,
    pub file_type: i16,
    pub mime_type: String,
    pub metadata: Option<JsonValue>,
    pub parent_folder_id: Option<i64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
