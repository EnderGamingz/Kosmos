use crate::model::file::{FileModel, FileType};
use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;

// Start: Album Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct AlbumModel {
    pub id: i64,
    pub user_id: i64,
    pub name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct AlbumModelDTO {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub description: Option<String>,
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
            created_at: model.created_at,
            updated_at: model.updated_at,
        }
    }
}
// End: Album Model

impl FileModel {
    pub fn get_valid_file_types_for_album() -> Vec<FileType> {
        vec![FileType::Image, FileType::RawImage, FileType::LargeImage]
    }

    pub fn is_valid_for_album(&self) -> bool {
        let file_type = FileType::by_id(self.file_type);

        Self::get_valid_file_types_for_album().contains(&file_type)
    }
}
