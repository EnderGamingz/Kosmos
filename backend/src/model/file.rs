use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::types::{JsonValue, Uuid};
use sqlx::{FromRow, Type};

#[derive(Clone, Copy, PartialEq, Debug, Serialize, Type)]
#[repr(i16)]
pub enum FileType {
    Generic = 0,
    Image = 1,
    Video = 2,
    Audio = 3,
    Document = 4,
    RawImage = 5,
    LargeImage = 6,
    Archive = 7,
    Editable = 8,
}

impl From<i16> for FileType {
    fn from(num: i16) -> Self {
        Self::by_id(num)
    }
}

impl FileType {
    pub fn by_id(num: i16) -> Self {
        match num {
            1 => FileType::Image,
            2 => FileType::Video,
            3 => FileType::Audio,
            4 => FileType::Document,
            5 => FileType::RawImage,
            6 => FileType::LargeImage,
            7 => FileType::Archive,
            8 => FileType::Editable,
            _ => FileType::Generic,
        }
    }

    pub const VALID_FILE_TYPES_FOR_ALBUM: [FileType; 3] =
        [FileType::Image, FileType::RawImage, FileType::LargeImage];

    pub const FILE_TYPES_FOR_UPDATE: [FileType; 1] = [FileType::Editable];
}

impl FileModel {
    pub fn is_valid_to_edit_content(&self) -> bool {
        FileType::FILE_TYPES_FOR_UPDATE.contains(&self.file_type)
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
    pub fn by_id(num: i16) -> PreviewStatus {
        match num {
            1 => PreviewStatus::Ready,
            2 => PreviewStatus::Failed,
            3 => PreviewStatus::Processing,
            _ => PreviewStatus::Unavailable,
        }
    }
}

// Start: File Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct FileModel {
    pub id: i64,
    pub user_id: i64,
    pub file_name: String,
    pub file_size: i64,
    pub file_type: FileType,
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
pub struct FileModelDTO {
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

impl From<FileModel> for FileModelDTO {
    fn from(model: FileModel) -> Self {
        FileModelDTO {
            id: model.id.to_string(),
            user_id: model.user_id.to_string(),
            file_name: model.file_name,
            file_size: model.file_size,
            file_type: model.file_type as i16,
            mime_type: model.mime_type,
            metadata: model.metadata,
            parent_folder_id: model.parent_folder_id.map(|v| v.to_string()),
            preview_status: model.preview_status,
            favorite: model.favorite,
            created_at: model.created_at,
            updated_at: model.updated_at,
            deleted_at: model.deleted_at,
        }
    }
}
// End: File Model

// Start: File Model With Share Info
#[derive(FromRow)]
pub struct FileModelWithShareInfo {
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
    pub share_uuid: Uuid,
    pub share_target_username: Option<String>,
}

#[derive(Serialize)]
pub struct FileModelWithShareInfoDTO {
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
    pub share_uuid: String,
    pub share_target_username: Option<String>,
}

impl From<FileModelWithShareInfo> for FileModelWithShareInfoDTO {
    fn from(model: FileModelWithShareInfo) -> Self {
        FileModelWithShareInfoDTO {
            id: model.id.to_string(),
            user_id: model.user_id.to_string(),
            file_name: model.file_name,
            file_size: model.file_size,
            file_type: model.file_type,
            mime_type: model.mime_type,
            metadata: model.metadata,
            parent_folder_id: model.parent_folder_id.map(|v| v.to_string()),
            preview_status: model.preview_status,
            favorite: model.favorite,
            created_at: model.created_at,
            updated_at: model.updated_at,
            deleted_at: model.deleted_at,
            share_uuid: model.share_uuid.to_string(),
            share_target_username: model.share_target_username,
        }
    }
}

// End: File Model With Share Info

// Start: Share File Model
#[derive(Serialize)]
pub struct ShareFileModelDTO {
    pub id: String,
    pub file_name: String,
    pub file_size: i64,
    pub file_type: i16,
    pub mime_type: String,
    pub metadata: Option<JsonValue>,
    pub preview_status: Option<i16>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<FileModel> for ShareFileModelDTO {
    fn from(model: FileModel) -> Self {
        ShareFileModelDTO {
            id: model.id.to_string(),
            file_name: model.file_name,
            file_size: model.file_size,
            file_type: model.file_type as i16,
            mime_type: model.mime_type,
            metadata: model.metadata,
            preview_status: model.preview_status,
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}
// End: Share File Model
