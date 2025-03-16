use crate::model::contact::{ContactModel, ContactRequestModel};
use crate::model::internal::contact_request_status::ContactRequestStatus;
use crate::model::profile::{ProfileContactModel, ProfileContactPendingModel};
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::contact::index::GetContactProfilesParamsDTO;
use crate::services::chat_service::ChatService;
use crate::KosmosPool;
use sonyflake::Sonyflake;
use sqlx::QueryBuilder;

#[derive(Clone)]
pub struct ContactService {
    db_pool: KosmosPool,
    sf: Sonyflake,
    pub chat_service: ChatService,
}

impl ContactService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        ContactService {
            db_pool: db_pool.clone(),
            sf: sf.clone(),
            chat_service: ChatService::new(db_pool, sf),
        }
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

    pub async fn check_users_have_pending_request(
        &self,
        user_id_1: i64,
        user_id_2: i64,
    ) -> Result<bool, AppError> {
        sqlx::query!(
            "SELECT EXISTS(SELECT 1 FROM contact_requests WHERE (user_id = $1 AND request_user_id = $2) AND status = $3 OR (user_id = $2 AND request_user_id = $1) AND status = $3)",
            user_id_1,
            user_id_2,
            ContactRequestStatus::Pending.to_string()
        )
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error checking if users have pending requests: {}", e);
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

    pub async fn create_contact_request(
        &self,
        from_user_id: i64,
        to_user_id: i64,
    ) -> Result<(), AppError> {
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

    pub async fn update_contact_request_to_user(
        &self,
        id: i64,
        user_id: i64,
        status: ContactRequestStatus,
    ) -> Result<(), AppError> {
        sqlx::query!(
            "UPDATE contact_requests SET status = $1 WHERE id = $2 AND request_user_id = $3",
            status.to_string(),
            id,
            user_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error updating contact request: {}", e);
            AppError::InternalError
        })?;
        Ok(())
    }

    pub async fn get_sent_requests_profiles(
        &self,
        from_user_id: i64,
    ) -> Result<Vec<ProfileContactPendingModel>, AppError> {
        sqlx::query_as!(
            ProfileContactPendingModel,
            "SELECT contact_requests.id, profiles.user_id, profiles.full_name, users.username, contact_requests.status FROM profiles
            INNER JOIN contact_requests ON contact_requests.request_user_id = profiles.user_id
            INNER JOIN users ON users.id = profiles.user_id
            WHERE contact_requests.user_id = $1 AND contact_requests.status = $2",
            from_user_id,
            ContactRequestStatus::Pending.to_string()
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

    pub async fn get_received_requests_profiles(
        &self,
        to_user_id: i64,
    ) -> Result<Vec<ProfileContactPendingModel>, AppError> {
        sqlx::query_as!(
            ProfileContactPendingModel,
            "SELECT contact_requests.id, profiles.user_id, profiles.full_name, users.username, contact_requests.status FROM profiles
            INNER JOIN contact_requests ON contact_requests.user_id = profiles.user_id
            INNER JOIN users ON users.id = profiles.user_id
            WHERE contact_requests.request_user_id = $1 AND contact_requests.status = $2",
            to_user_id,
            ContactRequestStatus::Pending.to_string()
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error checking for received requests: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_request_by_id_optional(
        &self,
        id: i64,
    ) -> Result<Option<ContactRequestModel>, AppError> {
        sqlx::query_as!(
            ContactRequestModel,
            "SELECT * FROM contact_requests WHERE id = $1 LIMIT 1",
            id
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting contact request by id: {}", e);
            AppError::InternalError
        })
    }

    pub async fn has_unhandled_requests(&self, user_id: i64) -> Result<bool, AppError> {
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

    pub async fn delete_contact_request(&self, id: i64) -> Result<(), AppError> {
        sqlx::query!("DELETE FROM contact_requests WHERE id = $1", id)
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error deleting contact request: {}", e);
                AppError::InternalError
            })?;
        Ok(())
    }

    pub async fn get_contacts_profiles(
        &self,
        user_id: i64,
    ) -> Result<Vec<ProfileContactModel>, AppError> {
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

    pub async fn get_contacts_profiles_by_search(
        &self,
        user_id: i64,
        params: GetContactProfilesParamsDTO,
    ) -> Result<Vec<ProfileContactModel>, AppError> {
        let mut query = QueryBuilder::new("SELECT profiles.*, users.username FROM profiles
            INNER JOIN contacts ON contacts.user_id_1 = profiles.user_id OR contacts.user_id_2 = profiles.user_id
            INNER JOIN users ON users.id = profiles.user_id
            WHERE (contacts.user_id_1 = ");

        query
            .push_bind(user_id)
            .push(" OR contacts.user_id_2 = ")
            .push_bind(user_id)
            .push(") AND profiles.user_id != ")
            .push_bind(user_id);

        let like_query = params
            .query
            .as_ref()
            .map(|search_query| format!("%{}%", search_query));

        if let Some(ref like_query) = like_query {
            query
                .push(" AND (profiles.full_name ILIKE ")
                .push_bind(like_query)
                .push(" OR users.username ILIKE ")
                .push_bind(like_query)
                .push(" OR profiles.email ILIKE ")
                .push_bind(like_query)
                .push(")");
        }

        query
            .push(" LIMIT ")
            .push_bind(&params.limit)
            .push(" OFFSET ")
            .push_bind(params.page * params.limit);

        query
            .build_query_as::<ProfileContactModel>()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error getting contacts profiles by search: {}", e);
                AppError::InternalError
            })
    }

    pub async fn create_contact_link(
        &self,
        user_id_1: i64,
        user_id_2: i64,
    ) -> Result<(), AppError> {
        let id = self.sf.next_id().map_err(|_| AppError::InternalError)? as i64;
        sqlx::query!(
            "INSERT INTO contacts (id, user_id_1, user_id_2) VALUES ($1, $2, $3)",
            id,
            user_id_1,
            user_id_2
        )
        .execute(&self.db_pool)
        .await
        .expect("Error creating contact link");
        Ok(())
    }

    pub async fn delete_contact_link(&self, user_id: i64, to_user_id: i64) -> Result<(), AppError> {
        sqlx::query!(
            "DELETE FROM contacts WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)",
            user_id,
            to_user_id
        )
        .execute(&self.db_pool)
        .await
        .expect("Error deleting contact link");
        Ok(())
    }
}
