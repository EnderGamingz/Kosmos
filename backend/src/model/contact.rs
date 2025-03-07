use crate::services::session_service::UserId;
use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use crate::model::internal::contact_request_status::ContactRequestStatus;

// Start: Contact Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct ContactModel {
    pub id: i64,
    pub user_id_1: UserId,
    pub user_id_2: UserId,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ContactModelDTO {
    pub user_id_1: UserId,
    pub user_id_2: UserId,
}

impl From<ContactModel> for ContactModelDTO {
    fn from(model: ContactModel) -> Self {
        ContactModelDTO {
            user_id_1: model.user_id_1,
            user_id_2: model.user_id_2,
        }
    }
}
// End: Contact Model

// Start: Contact Request Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct ContactRequestModel {
    pub id: i64,
    pub user_id: UserId,
    pub request_user_id: UserId,
    pub status: ContactRequestStatus,
    pub updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ContactRequestModelDTO {
    pub user_id: UserId,
    pub request_user_id: UserId,
    pub status: ContactRequestStatus,
}

impl From<ContactRequestModel> for ContactRequestModelDTO {
    fn from(model: ContactRequestModel) -> Self {
        ContactRequestModelDTO {
            user_id: model.user_id,
            request_user_id: model.request_user_id,
            status: model.status,
        }
    }
}
// End: Contact Request Model