use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::types::{JsonValue, Uuid};
use sqlx::FromRow;
use ts_rs::TS;
use crate::model::internal::file_type::FileType;
use crate::services::session_service::UserId;

// Start: File Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct FileModel {
    pub id: i64,
    pub user_id: UserId,
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

impl FileModel {
    pub fn is_valid_to_edit_content(&self) -> bool {
        FileType::FILE_TYPES_FOR_UPDATE.contains(&self.file_type)
    }
}

#[derive(Serialize, TS)]
#[ts(export)]
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
            preview_status: model.preview_status.map(|v| v as i16),
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
    pub user_id: UserId,
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

#[derive(Serialize, TS)]
#[ts(export)]
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
#[derive(Serialize, TS)]
#[ts(export)]
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
            preview_status: model.preview_status.map(|v| v as i16),
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}
// End: Share File Model
