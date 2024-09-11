use crate::services::session_service::UserId;
use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::types::Uuid;
use sqlx::FromRow;
use ts_rs::TS;
use crate::model::internal::share_type::ShareType;

// Start: Share Model
#[derive(Clone, FromRow, Debug)]
pub struct ShareModel {
    pub id: i64,
    pub uuid: Uuid,
    pub user_id: UserId,
    pub file_id: Option<i64>,
    pub folder_id: Option<i64>,
    pub album_id: Option<i64>,
    pub share_type: ShareType,
    pub share_target: Option<UserId>,
    pub access_limit: Option<i32>,
    pub password: Option<String>,
    pub access_count: i32,
    pub last_access: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct ShareModelDTO {
    pub id: String,
    pub uuid: String,
    pub user_id: String,
    pub file_id: Option<String>,
    pub folder_id: Option<String>,
    pub album_id: Option<String>,
    pub share_type: i16,
    pub share_target: Option<UserId>,
    pub access_limit: Option<i32>,
    pub password: Option<String>,
    pub access_count: i32,
    pub last_access: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
}

impl From<ShareModel> for ShareModelDTO {
    //noinspection DuplicatedCode
    fn from(model: ShareModel) -> Self {
        ShareModelDTO {
            id: model.id.to_string(),
            uuid: model.uuid.to_string(),
            user_id: model.user_id.to_string(),
            file_id: model.file_id.map(|id| id.to_string()),
            folder_id: model.folder_id.map(|id| id.to_string()),
            album_id: model.album_id.map(|id| id.to_string()),
            share_type: model.share_type as i16,
            share_target: model.share_target,
            access_limit: model.access_limit,
            password: model.password,
            access_count: model.access_count,
            last_access: model.last_access,
            created_at: model.created_at,
            expires_at: model.expires_at,
            updated_at: model.updated_at,
        }
    }
}

#[derive(Clone, FromRow, Debug)]
pub struct ExtendedShareModel {
    pub id: i64,
    pub uuid: Uuid,
    pub user_id: UserId,
    pub file_id: Option<i64>,
    pub folder_id: Option<i64>,
    pub album_id: Option<i64>,
    pub share_type: i16,
    pub share_target: Option<UserId>,
    pub access_limit: Option<i32>,
    pub password: Option<String>,
    pub access_count: i32,
    pub last_access: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
    pub share_target_username: Option<String>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct ExtendedShareModelDTO {
    pub id: String,
    pub uuid: String,
    pub user_id: String,
    pub file_id: Option<String>,
    pub folder_id: Option<String>,
    pub album_id: Option<String>,
    pub share_type: i16,
    pub share_target: Option<UserId>,
    pub share_target_username: Option<String>,
    pub access_limit: Option<i32>,
    pub password: Option<String>,
    pub access_count: i32,
    pub last_access: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
}

impl From<ExtendedShareModel> for ExtendedShareModelDTO {
    //noinspection DuplicatedCode
    fn from(model: ExtendedShareModel) -> Self {
        ExtendedShareModelDTO {
            id: model.id.to_string(),
            uuid: model.uuid.to_string(),
            user_id: model.user_id.to_string(),
            file_id: model.file_id.map(|id| id.to_string()),
            folder_id: model.folder_id.map(|id| id.to_string()),
            album_id: model.album_id.map(|id| id.to_string()),
            share_type: model.share_type,
            share_target: model.share_target,
            share_target_username: model.share_target_username,
            access_limit: model.access_limit,
            password: model.password,
            access_count: model.access_count,
            last_access: model.last_access,
            created_at: model.created_at,
            expires_at: model.expires_at,
            updated_at: model.updated_at,
        }
    }
}
// End: Share Model
