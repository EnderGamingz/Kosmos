use crate::model::chat::author::ChatAuthorModelDTO;
use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use ts_rs::TS;

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct DbChatMessageModel {
    pub id: i64,
    pub chat_id: i64,
    pub user_id: i64,
    pub content: String,
    pub parent_id: Option<i64>,
    pub is_edited: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Debug, TS)]
#[ts(export)]
pub struct ChatMessageModelDTO {
    pub id: String,
    pub chat_id: String,
    pub author: Option<ChatAuthorModelDTO>,
    pub content: String,
    pub parent: Option<Box<ChatMessageModelDTO>>,
    pub is_edited: bool,
    pub created_at: DateTime<Utc>,
}

impl DbChatMessageModel{
    pub fn to_dto(self, author: Option<ChatAuthorModelDTO>, parent: Option<ChatMessageModelDTO>) -> ChatMessageModelDTO {
        ChatMessageModelDTO {
            id: self.id.to_string(),
            chat_id: self.chat_id.to_string(),
            author,
            content: self.content,
            parent: parent.map(Box::new),
            is_edited: self.is_edited,
            created_at: self.created_at,
        }
    }
}