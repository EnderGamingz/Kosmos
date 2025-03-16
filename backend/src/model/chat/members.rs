use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct DbChatMemberModel {
    pub chat_id: i64,
    pub user_id: i64,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct DbChatMemberProfileModel {
    pub user_id: i64,
    pub username: String,
    pub full_name: Option<String>,
    pub avatar_image_id: Option<i64>,
}

#[derive(Serialize, Debug, Clone)]
pub struct ChatMemberModelDTO {
    pub chat_id: String,
    pub user_id: String,
    pub has_avatar: bool,
    pub full_name: Option<String>,
    pub username: String,
}
