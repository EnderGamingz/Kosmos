use crate::model::contact::{ContactModel, ContactRequestModel};
use crate::model::profile::ProfileModel;
use crate::response::error_handling::AppError;
use crate::KosmosPool;
use sonyflake::Sonyflake;
use crate::model::internal::contact_request_status::ContactRequestStatus;

#[derive(Clone)]
pub struct ContactService {
    db_pool: KosmosPool,
    sf: Sonyflake,
}

impl ContactService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        ContactService { db_pool, sf }
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
            tracing::error!("Error checking if profile exists: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_received_requests(
        &self,
        to_user_id: i64,
    ) -> Result<Vec<ContactRequestModel>, AppError> {
        sqlx::query_as!(
            ContactRequestModel,
            "SELECT * FROM contact_requests WHERE request_user_id = $1",
            to_user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error checking if profile exists: {}", e);
            AppError::InternalError
        })
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
            tracing::error!("Error checking if profile exists: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_contacts_profiles(&self, user_id: i64) -> Result<Vec<ProfileModel>, AppError> {
        sqlx::query_as!(
            ProfileModel,
            "SELECT * FROM profiles
                INNER JOIN contacts ON contacts.user_id_1 = profiles.user_id OR contacts.user_id_2 = profiles.user_id
                WHERE contacts.user_id_1 = $1 OR contacts.user_id_2 = $1",
            user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error checking if profile exists: {}", e);
            AppError::InternalError
        })
    }
}
