use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::types::JsonValue;
use sqlx::FromRow;

#[repr(i16)]
#[derive(Clone, Copy, PartialEq)]
pub enum FileType {
    Generic = 0,
    Image = 1,
    Video = 2,
    Audio = 3,
    Document = 4,
    RawImage = 5,
}

impl FileType {
    pub fn get_type_by_id(num: i16) -> FileType {
        match num {
            1 => FileType::Image,
            2 => FileType::Video,
            3 => FileType::Audio,
            4 => FileType::Document,
            5 => FileType::RawImage,
            _ => FileType::Generic,
        }
    }
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

#[derive(Serialize)]
pub struct ParsedFileModel {
    pub id: String,
    pub user_id: String,
    pub file_name: String,
    pub file_size: i64,
    pub file_type: i16,
    pub mime_type: String,
    pub metadata: Option<JsonValue>,
    pub parent_folder_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
