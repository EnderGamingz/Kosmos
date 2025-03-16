use serde::Serialize;
use sqlx::FromRow;

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct DbChatAuthorModel {
    pub user_id: i64,
    pub avatar_image_id: Option<i64>,
    pub full_name: Option<String>,
}

#[derive(Serialize, Debug)]
pub struct ChatAuthorModelDTO {
    pub user_id: String,
    pub has_avatar: bool,
    pub full_name: Option<String>,
}

impl From<DbChatAuthorModel> for ChatAuthorModelDTO {
    fn from(author: DbChatAuthorModel) -> Self {
        ChatAuthorModelDTO {
            user_id: author.user_id.to_string(),
            has_avatar: author.avatar_image_id.is_some(),
            full_name: author.full_name,
        }
    }
}