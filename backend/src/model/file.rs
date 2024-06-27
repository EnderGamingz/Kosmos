use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use sqlx::types::JsonValue;

#[repr(i16)]
#[derive(Clone, Copy, PartialEq)]
pub enum FileType {
    Generic = 0,
    Image = 1,
    Video = 2,
    Audio = 3,
    Document = 4,
    RawImage = 5,
    LargeImage = 6,
    Archive = 7,
}

impl FileType {
    pub fn get_type_by_id(num: i16) -> FileType {
        match num {
            1 => FileType::Image,
            2 => FileType::Video,
            3 => FileType::Audio,
            4 => FileType::Document,
            5 => FileType::RawImage,
            6 => FileType::LargeImage,
            7 => FileType::Archive,
            _ => FileType::Generic,
        }
    }
}

#[repr(i16)]
#[derive(Clone, Copy, PartialEq)]
pub enum PreviewStatus {
    Unavailable = 0,
    Ready = 1,
    Failed = 2,
    Processing = 3,
}

impl PreviewStatus {
    pub fn get_status_by_id(num: i16) -> PreviewStatus {
        match num {
            1 => PreviewStatus::Ready,
            2 => PreviewStatus::Failed,
            3 => PreviewStatus::Processing,
            _ => PreviewStatus::Unavailable,
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
    pub preview_status: Option<i16>,
    pub favorite: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
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
    pub preview_status: Option<i16>,
    pub favorite: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}
