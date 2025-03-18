use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use ts_rs::TS;
use crate::model::chat::members::ChatMemberModelDTO;
use crate::model::internal::chat_type::ChatType;

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct DbChatModel {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub chat_type: ChatType,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub latest_message_at: Option<DateTime<Utc>>,
}

#[derive(Serialize, Debug, TS)]
#[ts(export)]
pub struct ChatModelDTO {
    pub id: String,
    pub members: Vec<ChatMemberModelDTO>,
    pub name: String,
    pub description: Option<String>,
    pub chat_type: ChatType,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub latest_message_at: Option<DateTime<Utc>>,
}

impl DbChatModel {
    pub fn to_dto(&self, members: Vec<ChatMemberModelDTO>) -> ChatModelDTO {
        ChatModelDTO {
            id: self.id.to_string(),
            members,
            name: self.name.clone(),
            description: self.description.clone(),
            chat_type: self.chat_type.clone(),
            created_at: self.created_at.clone(),
            updated_at: self.updated_at.clone(),
            latest_message_at: self.latest_message_at.clone(),
        }
    }

    pub fn to_personal_chat_dto(
        &self,
        user_id: i64,
        members: Vec<ChatMemberModelDTO>,
    ) -> ChatModelDTO {
        let member_not_self = members
            .iter().find(|p| p.user_id != user_id.to_string())
            .map(|c| c.full_name.clone().unwrap_or(c.username.clone()));

        ChatModelDTO {
            id: self.id.to_string(),
            members,
            name: member_not_self.unwrap_or(self.name.clone()),
            description: None,
            chat_type: self.chat_type.clone(),
            created_at: self.created_at.clone(),
            updated_at: self.updated_at.clone(),
            latest_message_at: self.latest_message_at.clone(),
        }
    }
}