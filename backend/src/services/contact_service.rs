use crate::model::contact::{ContactModel, ContactRequestModel};
use crate::model::internal::contact_request_status::ContactRequestStatus;
use crate::model::profile::{ProfileContactModel};
use crate::response::error_handling::AppError;
use crate::KosmosPool;
use sonyflake::Sonyflake;

#[derive(Clone)]
pub struct ContactService {
    db_pool: KosmosPool,
    sf: Sonyflake,
}

impl ContactService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        ContactService { db_pool, sf }
    }

    pub async fn check_users_are_contacts(
        &self,
        user_id_1: i64,
        user_id_2: i64,
    ) -> Result<bool, AppError> {
        sqlx::query!(
            "SELECT EXISTS(SELECT 1 FROM contacts WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1))",
            user_id_1,
            user_id_2,
        )
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error checking if users are contacts: {}", e);
                AppError::InternalError
            })
            .map(|r| r.exists.unwrap_or(false))
    }

    pub async fn check_user_has_contact_request(
        &self,
        from_user_id: i64,
        to_user_id: i64,
    ) -> Result<bool, AppError> {
        sqlx::query!(
            "SELECT EXISTS(SELECT 1 FROM contact_requests WHERE user_id = $1 AND request_user_id = $2)",
            from_user_id,
            to_user_id,
        )
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error checking if users are in a contact request: {}", e);
                AppError::InternalError
            })
            .map(|r| r.exists.unwrap_or(false))
    }

    pub async fn create_contact_request(&self, from_user_id: i64, to_user_id: i64) -> Result<(), AppError> {
        let id = self.sf.next_id().map_err(|_| AppError::InternalError)? as i64;
        sqlx::query!(
            "INSERT INTO contact_requests (id, user_id, request_user_id, status) VALUES ($1, $2, $3, $4)",
            id,
            from_user_id,
            to_user_id,
            ContactRequestStatus::Pending.to_string()
        )
            .execute(&self.db_pool)
            .await
            .expect("Error creating contact request");
        Ok(())
    }

    pub async fn get_send_requests(
        &self,
        from_user_id: i64,
    ) -> Result<Vec<ContactRequestModel>, AppError> {
        sqlx::query_as!(
            ContactRequestModel,
            "SELECT * FROM contact_requests WHERE user_id = $1 AND status != $2",
            from_user_id,
            ContactRequestStatus::Accepted.to_string()
        )
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error checking for send requests: {}", e);
                AppError::InternalError
            })
    }

    pub async fn get_received_requests(
        &self,
        to_user_id: i64,
    ) -> Result<Vec<ContactRequestModel>, AppError> {
        sqlx::query_as!(
            ContactRequestModel,
            "SELECT * FROM contact_requests WHERE request_user_id = $1 AND status != $2",
            to_user_id,
            ContactRequestStatus::Accepted.to_string()
        )
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error checking for received requests: {}", e);
                AppError::InternalError
            })
    }

    pub async fn does_require_attention(&self, user_id: i64) -> Result<bool, AppError> {
        sqlx::query!(
            "SELECT EXISTS(SELECT 1 FROM contact_requests WHERE request_user_id = $1 AND status = $2)",
            user_id,
            ContactRequestStatus::Pending.to_string()
        )
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error checking if contacts require attention: {}", e);
                AppError::InternalError
            })
            .map(|r| r.exists.unwrap_or(false))
    }

    pub async fn get_contacts(&self, user_id: i64) -> Result<Vec<ContactModel>, AppError> {
        sqlx::query_as!(
            ContactModel,
            "SELECT * FROM contacts WHERE user_id_1 = $1 OR user_id_2 = $1",
            user_id
        )
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error getting contacts: {}", e);
                AppError::InternalError
            })
    }

    pub async fn get_contacts_profiles(&self, user_id: i64) -> Result<Vec<ProfileContactModel>, AppError> {
        sqlx::query_as!(
            ProfileContactModel,
            "SELECT profiles.*, users.username FROM profiles
            INNER JOIN contacts ON contacts.user_id_1 = profiles.user_id OR contacts.user_id_2 = profiles.user_id
            INNER JOIN users ON users.id = profiles.user_id
            WHERE (contacts.user_id_1 = $1 OR contacts.user_id_2 = $1) AND profiles.user_id != $1",
            user_id
        )
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error getting contacts profiles: {}", e);
                AppError::InternalError
            })
    }
}
