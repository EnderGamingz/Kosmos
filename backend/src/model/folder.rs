use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use sqlx::types::Uuid;

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct FolderModel {
    pub id: i64,
    pub user_id: i64,
    pub folder_name: String,
    pub parent_id: Option<i64>,
    pub favorite: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(FromRow)]
pub struct FolderModelWithShareInfo {
    pub id: i64,
    pub user_id: i64,
    pub folder_name: String,
    pub parent_id: Option<i64>,
    pub favorite: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub share_uuid: Uuid,
    pub share_target_username: Option<String>,
}

#[derive(Serialize)]
pub struct ParsedFolderModel {
    pub id: String,
    pub user_id: String,
    pub folder_name: String,
    pub parent_id: Option<String>,
    pub favorite: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ParsedFolderModelWithShareInfo {
    pub id: String,
    pub user_id: String,
    pub folder_name: String,
    pub parent_id: Option<String>,
    pub favorite: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub share_uuid: String,
    pub share_target_username: Option<String>,
}

#[derive(Serialize)]
pub struct ParsedShareFolderModel {
    pub id: String,
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

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct DirectoryWithShare {
    pub(crate) id: i64,
    pub(crate) folder_name: String,
    pub(crate) user_id: i64,
    pub(crate) parent_id: Option<i64>,
    pub(crate) path: Vec<String>,
    pub(crate) share_id: Option<i64>,
    pub(crate) share_type: Option<i16>,
    pub(crate) share_target: Option<i64>
}


#[derive(Clone, FromRow, Debug)]
pub struct SimpleDirectory {
    pub(crate) id: i64,
    pub(crate) folder_name: String,
}

#[derive(Serialize)]
pub struct ParsedSimpleDirectory {
    pub id: String,
    pub folder_name: String,
}

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct DeletionDirectory {
    pub(crate) id: i64,
    pub(crate) id_path: Vec<i64>,
    pub(crate) file_ids: Vec<i64>,
    pub(crate) file_types: Vec<i16>,
}