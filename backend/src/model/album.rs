use crate::model::file::{FileModel, FileType};
use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::types::Uuid;
use sqlx::FromRow;

// Start: Album Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct AlbumModel {
    pub id: i64,
    pub user_id: i64,
    pub name: String,
    pub description: Option<String>,
    pub preview_id: Option<i64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct AlbumModelDTO {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub description: Option<String>,
    pub preview_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<AlbumModel> for AlbumModelDTO {
    fn from(model: AlbumModel) -> Self {
        AlbumModelDTO {
            id: model.id.to_string(),
            user_id: model.user_id.to_string(),
            name: model.name,
            description: model.description,
            preview_id: model.preview_id.map(|id| id.to_string()),
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}
// End: Album Model

// Start: Shared Album Model
#[derive(Serialize)]
pub struct SharedAlbumModelDTO {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub preview_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<AlbumModel> for SharedAlbumModelDTO {
    fn from(model: AlbumModel) -> Self {
        SharedAlbumModelDTO {
            id: model.id.to_string(),
            name: model.name,
            description: model.description,
            preview_id: model.preview_id.map(|id| id.to_string()),
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}
// End: Shared Album Model

// Start: Album share with share info

#[derive(FromRow)]
pub struct AlbumModelWithShareInfo {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub preview_id: Option<i64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub share_uuid: Uuid,
    pub share_target_username: Option<String>,
}

#[derive(Serialize)]
pub struct AlbumModelWithShareInfoDTO {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub preview_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub share_uuid: String,
    pub share_target_username: Option<String>,
}

impl From<AlbumModelWithShareInfo> for AlbumModelWithShareInfoDTO {
    fn from(model: AlbumModelWithShareInfo) -> Self {
        AlbumModelWithShareInfoDTO {
            id: model.id.to_string(),
            name: model.name,
            description: model.description,
            preview_id: model.preview_id.map(|id| id.to_string()),
            created_at: model.created_at,
            updated_at: model.updated_at,
            share_uuid: model.share_uuid.to_string(),
            share_target_username: model.share_target_username,
        }
    }
}

// End: Album share with share info

impl FileModel {
    pub fn get_valid_file_types_for_album() -> Vec<FileType> {
        vec![FileType::Image, FileType::RawImage, FileType::LargeImage]
    }

    pub fn is_valid_for_album(&self) -> bool {
        let file_type = FileType::by_id(self.file_type);

        Self::get_valid_file_types_for_album().contains(&file_type)
    }
}
