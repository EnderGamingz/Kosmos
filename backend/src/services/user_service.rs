use bigdecimal::ToPrimitive;
use serde::{Deserialize, Serialize};
use sonyflake::Sonyflake;
use sqlx::{Execute, FromRow, QueryBuilder};
use sqlx::types::BigDecimal;
use tower_sessions::Session;
use validator::Validate;

use crate::db::{KosmosDb, KosmosDbResult};
use crate::KosmosPool;
use crate::model::user::UserModel;
use crate::response::error_handling::AppError;
use crate::services::session_service::{SessionService, UserId};

#[derive(Deserialize)]
pub struct AccountUpdatePayload {
    pub username: Option<String>,
    pub email: Option<String>,
}

#[derive(Serialize, Deserialize, Validate)]
pub struct RegisterCredentials {
    #[validate(length(min = 3, message = "Username must be at least 3 characters"))]
    pub username: String,
    #[validate(length(min = 6, message = "Password must be at least 6 characters"))]
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
        username: String,
        hash: String,
        storage_limit: i64,
    ) -> Result<UserId, AppError> {
        sqlx::query!(
            "INSERT INTO users (id, username, password_hash, storage_limit) VALUES ($1, $2, $3, $4) RETURNING id",
            self.sf.next_id().unwrap() as i64,
            username,
            hash,
            storage_limit
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error creating user: {}", e);
            return AppError::InternalError;
        })
        .map(|row| {
            tracing::info!(
                "User created successfully with username: {}",
                username
            );
            row.id
        })
    }

    pub async fn get_auth_user(&self, user_id: UserId) -> Result<UserModel, AppError> {
        let user = sqlx::query_as::<_, UserModel>("SELECT * FROM users WHERE id = $1")
            .bind(user_id)
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching user: {}", e);
                AppError::UserNotFound
            })?;

        match user {
            Some(user) => Ok(user),
            None => Err(AppError::UserNotFound),
        }
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

    pub async fn delete_user(&self, user_id: UserId) -> Result<KosmosDbResult, AppError> {
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
        user_id: UserId,
        payload: UpdateUserRequest,
    ) -> Result<UserModel, AppError> {
        sqlx::query_as!(
            UserModel,
            "UPDATE users SET username = $1, email = $2, full_name = $3 WHERE id = $4 RETURNING *",
            payload.username,
            payload.email,
            payload.full_name,
            user_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error updating user: {}", e);
            AppError::InternalError
        })
    }

    pub async fn update_storage_limit(
        &self,
        user_id: UserId,
        storage_limit: i64
    ) -> Result<KosmosDbResult, AppError> {
        sqlx::query!(
            "UPDATE users SET storage_limit = $1 WHERE id = $2",
            storage_limit,
            user_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error updating user: {}", e);
            AppError::InternalError
        })
    }

    pub async fn update_user_password(
        &self,
        user_id: UserId,
        password_hash: String,
    ) -> Result<KosmosDbResult, AppError> {
        sqlx::query!(
            "UPDATE users SET password_hash = $1 WHERE id = $2",
            password_hash,
            user_id
        )
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
