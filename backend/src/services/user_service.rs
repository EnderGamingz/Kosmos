use serde::{Deserialize, Serialize};
use sonyflake::Sonyflake;
use tower_sessions::Session;

use crate::db::KosmosDbResult;
use crate::model::user::UserModel;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
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
    ) -> Result<(), AppError> {
        sqlx::query("INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3)")
            .bind(self.sf.next_id().unwrap() as i64)
            .bind(&payload.username)
            .bind(hash)
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error creating user: {}", e);
                return AppError::InternalError;
            })
            .map(|_| ())
    }

    pub async fn check_user(&self, session: &Session) -> Result<UserModel, AppError> {
        let user_id = SessionService::check_logged_in(session).await?;
        let user_result = self.get_user(user_id).await?;

        match user_result {
            Some(user) => Ok(user),
            None => Err(AppError::UserNotFound)?,
        }
    }

    pub async fn get_auth_user(&self, user_id: String) -> Result<UserModel, AppError> {
        sqlx::query_as::<_, UserModel>("SELECT * FROM users WHERE id = $1")
            .bind(user_id)
            .fetch_one(&self.db_pool)
            .await
            .map_err(|_| AppError::UserNotFound)
    }

    pub async fn check_user_optional(
        &self,
        session: &Session,
    ) -> Result<Option<UserModel>, AppError> {
        let user_id = SessionService::get_session_id(session).await;

        match user_id {
            Some(user) => self.get_user(user).await,
            None => Ok(None),
        }
    }

    pub async fn get_user(&self, user_id: String) -> Result<Option<UserModel>, AppError> {
        sqlx::query_as::<_, UserModel>("SELECT * FROM users WHERE id = $1 LIMIT 1")
            .bind(user_id)
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|_| AppError::InternalError)
    }

    pub async fn get_user_by_username(&self, username: String) -> Result<UserModel, AppError> {
        let user = sqlx::query_as::<_, UserModel>("SELECT * FROM users where username = $1")
            .bind(username)
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|_| AppError::InternalError)?;
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
            .map_err(|_| AppError::InternalError)
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
            .map_err(|_| AppError::InternalError)
    }

    pub async fn get_all_users(&self) -> Result<Vec<UserModel>, AppError> {
        sqlx::query_as::<_, UserModel>("SELECT * FROM users")
            .fetch_all(&self.db_pool)
            .await
            .map_err(|_| AppError::InternalError)
    }
}
