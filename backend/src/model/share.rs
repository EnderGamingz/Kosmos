use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use crate::services::session_service::UserId;

#[repr(i16)]
#[derive(Clone, Copy, PartialEq)]
pub enum ShareType {
    Public = 0,
    Private = 1,
}

impl ShareType {
    pub fn get_type_by_id(num: i16) -> ShareType {
        match num {
            1 => ShareType::Private,
            _ => ShareType::Public,
        }
    }
}

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct ShareModel {
    pub id: i64,
    pub uuid: String,
    pub user_id: UserId,
    pub file_id: Option<i64>,
    pub folder_id: Option<i64>,
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

#[derive(Serialize)]
pub struct ParsedShareModel {
    pub id: String,
    pub uuid: String,
    pub user_id: String,
    pub file_id: Option<String>,
    pub folder_id: Option<String>,
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
