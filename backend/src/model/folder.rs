use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use sqlx::types::Uuid;
use ts_rs::TS;
use crate::services::session_service::UserId;

// Start: Folder Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct FolderModel {
    pub id: i64,
    pub user_id: UserId,
    pub folder_name: String,
    pub parent_id: Option<i64>,
    pub favorite: bool,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct FolderModelDTO {
    pub id: String,
    pub user_id: String,
    pub folder_name: String,
    pub parent_id: Option<String>,
    pub favorite: bool,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<FolderModel> for FolderModelDTO {
    fn from(model: FolderModel) -> Self {
        FolderModelDTO {
            id: model.id.to_string(),
            user_id: model.user_id.to_string(),
            folder_name: model.folder_name,
            parent_id: model.parent_id.map(|id| id.to_string()),
            favorite: model.favorite,
            color: model.color,
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}
// End: Folder Model

// Start: Folder Model With Share Info
#[derive(FromRow)]
pub struct FolderModelWithShareInfo {
    pub id: i64,
    pub user_id: UserId,
    pub folder_name: String,
    pub parent_id: Option<i64>,
    pub favorite: bool,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub share_uuid: Uuid,
    pub share_target_username: Option<String>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct FolderModelWithShareInfoDTO {
    pub id: String,
    pub user_id: String,
    pub folder_name: String,
    pub parent_id: Option<String>,
    pub favorite: bool,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub share_uuid: String,
    pub share_target_username: Option<String>,
}

impl From<FolderModelWithShareInfo> for FolderModelWithShareInfoDTO {
    fn from(model: FolderModelWithShareInfo) -> Self {
        FolderModelWithShareInfoDTO {
            id: model.id.to_string(),
            user_id: model.user_id.to_string(),
            folder_name: model.folder_name,
            parent_id: model.parent_id.map(|id| id.to_string()),
            favorite: model.favorite,
            color: model.color,
            created_at: model.created_at,
            updated_at: model.updated_at,
            share_uuid: model.share_uuid.to_string(),
            share_target_username: model.share_target_username,
        }
    }
}
// End: Folder Model With Share Info

// Start: Share Folder Model
#[derive(Serialize, TS)]
#[ts(export)]
pub struct ShareFolderModelDTO {
    pub id: String,
    pub folder_name: String,
    pub color: Option<String>,
    pub parent_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<FolderModel> for ShareFolderModelDTO {
    fn from(model: FolderModel) -> Self {
        ShareFolderModelDTO {
            id: model.id.to_string(),
            folder_name: model.folder_name,
            color: model.color,
            parent_id: model.parent_id.map(|id| id.to_string()),
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}
// End: Share Folder Model

// Start: Directory
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct Directory {
    pub id: i64,
    pub folder_name: String,
    pub user_id: UserId,
    pub path: Vec<String>,
    pub files: Vec<i64>,
    pub file_names: Vec<String>,
}
// End: Directory

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct DirectoryWithShare {
    pub id: i64,
    pub folder_name: String,
    pub user_id: UserId,
    pub parent_id: Option<i64>,
    pub path: Vec<String>,
    pub share_id: Option<i64>,
    pub share_type: Option<i16>,
    pub share_target: Option<i64>
}

// Start: Simple Directory
#[derive(Clone, FromRow, Debug)]
pub struct SimpleDirectory {
    pub id: i64,
    pub folder_name: String,
    pub color: Option<String>
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct SimpleDirectoryDTO {
    pub id: String,
    pub folder_name: String,
    pub color: Option<String>
}

impl From<SimpleDirectory> for SimpleDirectoryDTO {
    fn from(model: SimpleDirectory) -> Self {
        SimpleDirectoryDTO {
            id: model.id.to_string(),
            folder_name: model.folder_name,
            color: model.color
        }
    }
}
// End: Simple Directory

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct DeletionDirectory {
    pub id: i64,
    pub id_path: Vec<i64>,
    pub file_ids: Vec<i64>,
    pub file_types: Vec<i16>,
}