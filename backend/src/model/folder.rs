use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct FolderModel {
    pub id: i64,
    pub user_id: i64,
    pub folder_name: String,
    pub parent_id: Option<i64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ParsedFolderModel {
    pub id: String,
    pub user_id: String,
    pub folder_name: String,
    pub parent_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct Directory {
    pub(crate) id: i64,
    pub(crate) folder_name: String,
    pub(crate) user_id: i64,
    pub(crate) path: Vec<String>,
    pub(crate) files: Vec<i64>,
    pub(crate) file_names: Vec<String>,
}
