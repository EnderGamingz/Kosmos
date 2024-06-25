use serde::{Deserialize, Serialize};
use sonyflake::Sonyflake;
use sqlx::types::BigDecimal;
use sqlx::{Execute, FromRow, QueryBuilder};
use tower_sessions::Session;
use bigdecimal::ToPrimitive;

use crate::db::{KosmosDb, KosmosDbResult};
use crate::model::user::{ParsedUserModel, UserModel};
use crate::response::error_handling::AppError;
use crate::services::session_service::{SessionService, UserId};
use crate::KosmosPool;

#[derive(Deserialize)]
pub struct AccountUpdatePayload {
    pub username: Option<String>,
    pub email: Option<String>,
}

#[derive(Deserialize)]
pub struct PasswordUpdatePayload {
    pub old_password: String,
    pub new_password: String,
}

#[derive(Serialize, Deserialize)]
pub struct RegisterCredentials {
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateUserRequest {
    pub username: String,
    pub full_name: Option<String>,
    pub email: Option<String>,
}

#[derive(Debug, FromRow)]
pub struct FileSizeSum {
    sum: Option<BigDecimal>,
}

#[derive(Clone)]
pub struct UserService {
    db_pool: KosmosPool,
    sf: Sonyflake,
}

impl UserService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        UserService { db_pool, sf }
    }

    pub async fn create_user(
        &self,
        payload: RegisterCredentials,
        hash: String,
        storage_limit: i64,
    ) -> Result<(), AppError> {
        sqlx::query!(
            "INSERT INTO users (id, username, password_hash, storage_limit) VALUES ($1, $2, $3, $4)",
            self.sf.next_id().unwrap() as i64,
            &payload.username,
            hash,
            storage_limit
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error creating user: {}", e);
            return AppError::InternalError;
        })
        .map(|_| {
            tracing::info!(
                "User created successfully with username: {}",
                payload.username
            );
            ()
        })
    }

    pub fn parse_user(user: UserModel) -> ParsedUserModel {
        ParsedUserModel {
            id: user.id.to_string(),
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            storage_limit: user.storage_limit,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }

    pub async fn check_user(&self, session: &Session) -> Result<UserModel, AppError> {
        let user_id = SessionService::check_logged_in(session).await?;
        let user_result = self.get_user(user_id).await?;

        match user_result {
            Some(user) => Ok(user),
            None => Err(AppError::UserNotFound)?,
        }
    }

    pub async fn get_auth_user(&self, user_id: UserId) -> Result<UserModel, AppError> {
        sqlx::query_as::<_, UserModel>("SELECT * FROM users WHERE id = $1")
            .bind(user_id)
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching user: {}", e);
                AppError::UserNotFound
            })
    }

    pub async fn check_user_optional(
        &self,
        session: &Session,
    ) -> Result<Option<UserModel>, AppError> {
        let user_id = SessionService::get_user_id(session).await;

        match user_id {
            Some(user) => self.get_user(user).await,
            None => Ok(None),
        }
    }

    pub async fn get_user(&self, user_id: UserId) -> Result<Option<UserModel>, AppError> {
        sqlx::query_as::<_, UserModel>("SELECT * FROM users WHERE id = $1 LIMIT 1")
            .bind(user_id)
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching user: {}", e);
                AppError::InternalError
            })
    }

    pub async fn get_user_by_username(&self, username: String) -> Result<UserModel, AppError> {
        let user = sqlx::query_as::<_, UserModel>("SELECT * FROM users where username = $1")
            .bind(username)
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching user by username: {}", e);
                AppError::InternalError
            })?;
        match user {
            Some(user) => Ok(user),
            None => Err(AppError::UserNotFound)?,
        }
    }

    pub async fn get_user_by_username_optional(
        &self,
        username: &String,
    ) -> Result<Option<UserModel>, AppError> {
        sqlx::query_as::<_, UserModel>("SELECT * FROM users where username = $1")
            .bind(username)
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching user by username: {}", e);
                return AppError::InternalError;
            })
    }

    pub async fn delete_user(&self, user_id: i32) -> Result<KosmosDbResult, AppError> {
        sqlx::query("DELETE FROM users WHERE id = $1")
            .bind(user_id)
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error deleting user: {}", e);
                AppError::InternalError
            })
    }

    pub async fn update_user(
        &self,
        user_id: i32,
        payload: UpdateUserRequest,
    ) -> Result<KosmosDbResult, AppError> {
        sqlx::query("UPDATE users SET username = $1, email = $2, full_name = $3 WHERE id = $4")
            .bind(payload.username)
            .bind(payload.email)
            .bind(payload.full_name)
            .bind(user_id)
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error updating user: {}", e);
                AppError::InternalError
            })
    }

    pub async fn get_all_users(&self) -> Result<Vec<UserModel>, AppError> {
        sqlx::query_as::<_, UserModel>("SELECT * FROM users")
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching all users: {}", e);
                AppError::InternalError
            })
    }

    fn get_storage_query(user_id: UserId, marked_deleted: Option<bool>) -> String {
        let mut query: QueryBuilder<KosmosDb> =
            QueryBuilder::new("SELECT SUM (file_size) FROM files WHERE user_id = ");
        query.push_bind(user_id);

        if let Some(bool) = marked_deleted {
            if bool {
                query.push(" AND deleted_at IS NOT NULL");
            } else {
                query.push(" AND deleted_at IS NULL");
            }
        }

        query.build().sql().into()
    }

    pub async fn get_user_storage_usage(
        &self,
        user_id: UserId,
        marked_deleted: Option<bool>,
    ) -> Result<i64, AppError> {
        sqlx::query_as::<_, FileSizeSum>(&*Self::get_storage_query(user_id, marked_deleted))
            .bind(user_id)
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching user storage usage: {}", e);
                AppError::InternalError
            })
            .map(|row| row.sum.unwrap_or(BigDecimal::from(0)))
            .map(|sum| sum.to_i64().unwrap_or(0))
    }

    pub async fn get_user_storage_limit(&self, user_id: UserId) -> Result<i64, AppError> {
        sqlx::query!("SELECT storage_limit FROM users WHERE id = $1", user_id)
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching user storage limit: {}", e);
                AppError::InternalError
            })
            .map(|row| row.storage_limit)
    }
}
