use crate::db::KosmosPool;
use crate::model::chat::author::DbChatAuthorModel;
use crate::model::chat::chat::DbChatModel;
use crate::model::chat::members::{
    ChatMemberModelDTO, DbChatMemberModel, DbChatMemberProfileModel,
};
use crate::model::chat::message::DbChatMessageModel;
use crate::model::internal::chat_type::ChatType;
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::chat::index::GetChatsQueryDTO;
use crate::routes::api::v1::auth::chat::message::create::CreateChatMessageDTO;
use crate::services::session_service::UserId;
use serde::Deserialize;
use sonyflake::Sonyflake;
use sqlx::QueryBuilder;
use std::collections::HashMap;
use validator::Validate;

#[derive(Deserialize, Validate, Debug)]
pub struct MessageQueryDTO {
    #[serde(default = "get_default_message_limit")]
    #[validate(range(min = 1, max = 500))]
    pub limit: i64,

    #[serde(default = "get_default_page")]
    #[validate(range(min = 0))]
    pub page: i64,
}

fn get_default_message_limit() -> i64 {
    50
}

fn get_default_page() -> i64 {
    0
}

#[derive(Clone)]
pub struct ChatService {
    db_pool: KosmosPool,
    sf: Sonyflake,
}

impl ChatService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        ChatService { db_pool, sf }
    }

    pub async fn rename_group_chat(&self, chat_id: i64, name: String) -> Result<(), AppError> {
        sqlx::query!("UPDATE chats SET name = $1 WHERE id = $2", name, chat_id)
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error renaming group chat: {}", e);
                AppError::InternalError
            })?;
        Ok(())
    }

    pub async fn remove_user_from_chat(
        &self,
        user_id: UserId,
        chat_id: i64,
    ) -> Result<(), AppError> {
        sqlx::query!(
            "DELETE FROM chat_members WHERE user_id = $1 AND chat_id = $2",
            user_id,
            chat_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error removing user from chat: {}", e);
            AppError::InternalError
        })?;
        Ok(())
    }

    pub async fn get_chat_member_count(&self, chat_id: i64) -> Result<i64, AppError> {
        sqlx::query!(
            "SELECT COUNT(*) FROM chat_members WHERE chat_id = $1",
            chat_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching chat member count: {}", e);
            AppError::InternalError
        })
        .map(|row| row.count.unwrap_or(0))
    }

    pub async fn delete_chat(&self, chat_id: i64) -> Result<(), AppError> {
        sqlx::query!("DELETE FROM chats WHERE id = $1", chat_id)
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error deleting chat: {}", e);
                AppError::InternalError
            })?;
        Ok(())
    }

    pub async fn create_message(
        &self,
        user_id: i64,
        chat_id: i64,
        payload: &CreateChatMessageDTO,
    ) -> Result<DbChatMessageModel, AppError> {
        let id = self.sf.next_id().map_err(|_| AppError::InternalError)? as i64;
        let parent_id: Option<i64> = payload.parent_id.map(|id| id.into());
        sqlx::query_as!(
            DbChatMessageModel,
            "INSERT INTO messages (id, chat_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            id,
            chat_id,
            user_id,
            payload.content,
            parent_id
        )
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error creating message: {}", e);
                AppError::InternalError
            })
    }

    pub async fn set_latest_message_at_now(&self, chat_id: i64) -> Result<(), AppError> {
        sqlx::query!(
            "UPDATE chats SET latest_message_at = NOW() WHERE id = $1",
            chat_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error updating latest message time: {}", e);
            AppError::InternalError
        })?;

        Ok(())
    }

    pub async fn delete_message(&self, message_id: i64) -> Result<(), AppError> {
        sqlx::query!("DELETE FROM messages WHERE id = $1", message_id)
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error deleting message: {}", e);
                AppError::InternalError
            })?;

        Ok(())
    }

    pub async fn update_message(
        &self,
        message_id: i64,
        content: String,
    ) -> Result<DbChatMessageModel, AppError> {
        sqlx::query_as!(
            DbChatMessageModel,
            "UPDATE messages SET content = $1, is_edited = true WHERE id = $2 RETURNING *",
            content,
            message_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error updating message: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_group_chat_optional_from_user(
        &self,
        user_id: UserId,
        chat_id: i64,
    ) -> Result<Option<DbChatModel>, AppError> {
        sqlx::query_as!(
            DbChatModel,
            r#"SELECT * FROM chats WHERE chat_type = $3 AND id = $1 AND EXISTS
                (SELECT 1 FROM chat_members WHERE user_id = $2 AND chat_id = $1);"#,
            chat_id,
            user_id,
            ChatType::Group.to_string()
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error checking personal chat: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_personal_chat_optional(
        &self,
        user_id: i64,
        other_user_id: i64,
    ) -> Result<Option<DbChatModel>, AppError> {
        if user_id == other_user_id {
            return Ok(None);
        }

        sqlx::query_as!(
            DbChatModel,
            r#"SELECT * FROM chats WHERE chat_type = $3 AND id IN (
                SELECT chat_id FROM chat_members WHERE user_id = $1
                INTERSECT
                SELECT chat_id FROM chat_members WHERE user_id = $2
            )"#,
            user_id,
            other_user_id,
            ChatType::Personal.to_string()
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error checking personal chat: {}", e);
            AppError::InternalError
        })
    }

    pub async fn create_personal_chat(
        &self,
        user_id: i64,
        other_user_id: i64,
    ) -> Result<DbChatModel, AppError> {
        let chat_id = self.sf.next_id().map_err(|_| AppError::InternalError)? as i64;

        let mut tx = self.db_pool.begin().await.map_err(|e| {
            tracing::error!("Error starting transaction: {}", e);
            AppError::InternalError
        })?;

        let chat = sqlx::query_as!(
            DbChatModel,
            "INSERT INTO chats (id, name, chat_type) VALUES ($1, $2, $3) RETURNING *",
            chat_id,
            "personal_chat_name",
            ChatType::Personal.to_string()
        )
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| {
            tracing::error!("Error creating personal chat: {}", e);
            AppError::InternalError
        })?;

        sqlx::query!(
            "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)",
            chat_id,
            user_id
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            tracing::error!("Error adding member to personal chat: {}", e);
            AppError::InternalError
        })?;

        sqlx::query!(
            "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)",
            chat_id,
            other_user_id
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            tracing::error!("Error adding member to personal chat: {}", e);
            AppError::InternalError
        })?;

        tx.commit().await.map_err(|e| {
            tracing::error!("Error committing transaction: {}", e);
            AppError::InternalError
        })?;

        Ok(chat)
    }

    pub async fn create_group_chat(
        &self,
        chat_name: String,
        user_id: UserId,
    ) -> Result<DbChatModel, AppError> {
        let chat_id = self.sf.next_id().map_err(|_| AppError::InternalError)? as i64;

        let mut tx = self.db_pool.begin().await.map_err(|e| {
            tracing::error!("Error starting transaction: {}", e);
            AppError::InternalError
        })?;

        let chat = sqlx::query_as!(
            DbChatModel,
            "INSERT INTO chats (id, name, chat_type) VALUES ($1, $2, $3) RETURNING *",
            chat_id,
            chat_name,
            ChatType::Group.to_string()
        )
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| {
            tracing::error!("Error creating group chat: {}", e);
            AppError::InternalError
        })?;

        sqlx::query!(
            "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)",
            chat_id,
            user_id
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            tracing::error!("Error adding member to group chat: {}", e);
            AppError::InternalError
        })?;

        tx.commit().await.map_err(|e| {
            tracing::error!("Error committing transaction: {}", e);
            AppError::InternalError
        })?;

        Ok(chat)
    }

    pub async fn add_chat_member(&self, chat_id: i64, user_id: i64) -> Result<(), AppError> {
        sqlx::query!(
            "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)",
            chat_id,
            user_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error adding chat member: {}", e);
            AppError::InternalError
        })?;

        Ok(())
    }

    pub async fn get_chats(
        &self,
        user_id: i64,
        params: &GetChatsQueryDTO,
    ) -> Result<Vec<DbChatModel>, AppError> {
        // SELECT c.*
        // FROM chats c
        // WHERE (c.chat_type = 'personal'
        //     AND EXISTS (SELECT 1
        //                 FROM chat_members AS cm
        //                          JOIN chat_members AS cm2 ON cm.chat_id = cm2.chat_id AND cm.user_id != cm2.user_id
        //                          JOIN contacts AS con
        //                               ON ((con.user_id_1 = <id> AND con.user_id_2 = cm2.user_id) OR
        //                                   (con.user_id_1 = cm2.user_id AND con.user_id_2 = <id>))
        //                 WHERE cm.user_id = <id>
        //                   AND c.id = cm.chat_id))
        //    OR (c.chat_type = 'group'
        //     AND EXISTS (SELECT 1
        //                 FROM chat_members AS cm
        //                 WHERE cm.user_id = <id>
        //                   AND c.id = cm.chat_id));
        let mut query = QueryBuilder::new("SELECT c.* FROM chats c WHERE (c.chat_type = ");
        query
            .push_bind(ChatType::Personal.to_string())
            .push(" AND EXISTS (SELECT 1 FROM chat_members AS cm
                         JOIN chat_members AS cm2 ON cm.chat_id = cm2.chat_id AND cm.user_id != cm2.user_id
                         JOIN contacts AS con ON ((con.user_id_1 =")
            .push_bind(user_id)
            .push(" AND con.user_id_2 = cm2.user_id) OR (con.user_id_1 = cm2.user_id AND con.user_id_2 = ")
            .push_bind(user_id)
            .push(" )) WHERE cm.user_id = ")
            .push_bind(user_id)
            .push(" AND c.id = cm.chat_id)) OR (c.chat_type = ")
            .push_bind(ChatType::Group.to_string())
            .push(" AND EXISTS (SELECT 1 FROM chat_members AS cm WHERE cm.user_id = ")
            .push_bind(user_id)
            .push(" AND c.id = cm.chat_id))")
            .push(" LIMIT ")
            .push_bind(&params.limit)
            .push(" OFFSET ")
            .push_bind(params.page * params.limit);

        query
            .build_query_as::<DbChatModel>()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching chats: {}", e);
                AppError::InternalError
            })
    }

    pub async fn get_chat(&self, chat_id: i64) -> Result<DbChatModel, AppError> {
        sqlx::query_as!(DbChatModel, "SELECT * FROM chats WHERE id = $1", chat_id)
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching chat: {}", e);
                AppError::InternalError
            })
    }

    pub async fn get_chat_members_by_chat_ids(
        &self,
        chat_ids: Vec<i64>,
    ) -> Result<Vec<DbChatMemberModel>, AppError> {
        sqlx::query_as!(
            DbChatMemberModel,
            "SELECT * FROM chat_members WHERE chat_id = ANY($1)",
            &chat_ids
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching chat members by chat IDs: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_chat_members_by_chat_id(
        &self,
        chat_id: i64,
    ) -> Result<Vec<DbChatMemberModel>, AppError> {
        sqlx::query_as!(
            DbChatMemberModel,
            "SELECT * FROM chat_members WHERE chat_id = $1",
            chat_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching chat members by chat ID: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_chat_members_profiles(
        &self,
        user_ids: Vec<i64>,
    ) -> Result<Vec<DbChatMemberProfileModel>, AppError> {
        sqlx::query_as!(
            DbChatMemberProfileModel,
            r#"SELECT users.id as user_id, users.username, users.avatar_image_id, profiles.full_name
            FROM users
                     INNER JOIN profiles ON users.id = profiles.user_id
            WHERE users.id = ANY($1);
            "#,
            &user_ids
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching chat members profiles: {}", e);
            AppError::InternalError
        })
    }

    /// Zips chat members with their profiles into a vector of `ChatMemberModelDTO`.
    pub fn zip_chat_members_profiles(
        chat_members: Vec<DbChatMemberModel>,
        chat_members_profiles: Vec<DbChatMemberProfileModel>,
    ) -> Vec<ChatMemberModelDTO> {
        let chat_members_profiles_map: HashMap<_, _> = chat_members_profiles
            .into_iter()
            .map(|profile| (profile.user_id, profile))
            .collect();

        chat_members
            .into_iter()
            .filter_map(|member| {
                chat_members_profiles_map
                    .get(&member.user_id)
                    .map(|profile| ChatMemberModelDTO {
                        chat_id: member.chat_id.to_string(),
                        user_id: member.user_id.to_string(),
                        has_avatar: profile.avatar_image_id.is_some(),
                        full_name: profile.full_name.clone(),
                        username: profile.username.clone(),
                    })
            })
            .collect()
    }

    pub async fn get_messages(
        &self,
        chat_id: i64,
        params: MessageQueryDTO,
    ) -> Result<Vec<DbChatMessageModel>, AppError> {
        let offset = params.page * params.limit;
        let limit = params.limit;

        sqlx::query_as!(
            DbChatMessageModel,
            r#"SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"#,
            chat_id,
            limit,
            offset
        )
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching messages: {}", e);
                AppError::InternalError
            })
    }

    pub async fn get_message_by_id(&self, message_id: i64) -> Result<DbChatMessageModel, AppError> {
        sqlx::query_as!(
            DbChatMessageModel,
            "SELECT * FROM messages WHERE id = $1",
            message_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching message: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_messages_by_message_ids(
        &self,
        message_ids: Vec<i64>,
    ) -> Result<Vec<DbChatMessageModel>, AppError> {
        sqlx::query_as!(
            DbChatMessageModel,
            r#"SELECT * FROM messages WHERE id = ANY($1)"#,
            &message_ids
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching messages by IDs: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_authors_by_user_ids(
        &self,
        user_ids: Vec<i64>,
    ) -> Result<Vec<DbChatAuthorModel>, AppError> {
        sqlx::query_as!(
            DbChatAuthorModel,
            r#"SELECT users.id as user_id, users.avatar_image_id, users.username, profiles.full_name
            FROM users
                     INNER JOIN profiles ON users.id = profiles.user_id
            WHERE users.id = ANY($1);
            "#,
            &user_ids
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching chat authors: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_author_by_user_id(&self, user_id: i64) -> Result<DbChatAuthorModel, AppError> {
        sqlx::query_as!(
            DbChatAuthorModel,
            r#"SELECT users.id as user_id, users.avatar_image_id, users.username, profiles.full_name
            FROM users
                     INNER JOIN profiles ON users.id = profiles.user_id
            WHERE users.id = $1;
            "#,
            user_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching chat author: {}", e);
            AppError::InternalError
        })
    }

    pub async fn check_message_id_exists_in_chat(
        &self,
        message_id: i64,
        chat_id: i64,
    ) -> Result<bool, AppError> {
        let exists = sqlx::query!(
            r#"SELECT EXISTS(SELECT 1 FROM messages WHERE id = $1 AND chat_id = $2)"#,
            message_id,
            chat_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error checking message ID existence: {}", e);
            AppError::InternalError
        })?;

        Ok(exists.exists.unwrap_or(false))
    }

    pub async fn check_message_id_exists_in_chat_by_user_id(
        &self,
        message_id: i64,
        chat_id: i64,
        user_id: i64,
    ) -> Result<bool, AppError> {
        let exists = sqlx::query!(
            r#"SELECT EXISTS(SELECT 1 FROM messages WHERE id = $1 AND chat_id = $2 AND user_id = $3)"#,
            message_id,
            chat_id,
            user_id
        )
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error checking message ID existence by user ID: {}", e);
                AppError::InternalError
            })?;

        Ok(exists.exists.unwrap_or(false))
    }
}
