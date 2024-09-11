use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::types::Uuid;
use sqlx::FromRow;
use ts_rs::TS;

// Start: User Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct UserModel {
    pub id: i64,
    pub username: String,
    pub password_hash: String,
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub storage_limit: i64,
    pub role: i16,
    pub uuid: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct UserModelDTO {
    pub id: String,
    pub username: String,
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub storage_limit: i64,
    pub role: i16,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<UserModel> for UserModelDTO {
    fn from(user: UserModel) -> Self {
        UserModelDTO {
            id: user.id.to_string(),
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            storage_limit: user.storage_limit,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }
}
// End: User Model
