use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use ts_rs::TS;
use crate::model::internal::contact_request_status::ContactRequestStatus;

// Start: Profile Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct ProfileModel {
    pub id: i64,
    pub user_id: i64,
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub website: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct ProfileModelDTO {
    pub user_id: String,
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub website: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,
}

impl From<ProfileModel> for ProfileModelDTO {
    fn from(model: ProfileModel) -> Self {
        ProfileModelDTO {
            user_id: model.user_id.to_string(),
            full_name: model.full_name,
            email: model.email,
            phone_number: model.phone_number,
            website: model.website,
            bio: model.bio,
            location: model.location,
        }
    }
}
// End: Profile Model

// Start: Profile Contact Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct ProfileContactModel {
    pub id: i64,
    pub user_id: i64,
    pub username: String,
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub website: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct ProfileContactPendingModel {
    pub id: i64,
    pub user_id: i64,
    pub status:ContactRequestStatus,
    pub username: String,
    pub full_name: Option<String>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct ProfileContactModelDTO {
    pub user_id: String,
    pub username: String,
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub phone_number: Option<String>,
    pub website: Option<String>,
    pub bio: Option<String>,
    pub location: Option<String>,
}

impl From<ProfileContactModel> for ProfileContactModelDTO {
    fn from(model: ProfileContactModel) -> Self {
        ProfileContactModelDTO {
            user_id: model.user_id.to_string(),
            username: model.username,
            full_name: model.full_name,
            email: model.email,
            phone_number: model.phone_number,
            website: model.website,
            bio: model.bio,
            location: model.location,
        }
    }
}
// End: Profile Contact Model

// Start: Profile Contact Lite Model
#[derive(Serialize, TS)]
#[ts(export)]
pub struct ProfileContactPendingModelDTO {
    pub id: String,
    pub user_id: String,
    pub username: String,
    pub full_name: Option<String>,
    pub status: ContactRequestStatus,
}

impl From<ProfileContactPendingModel> for ProfileContactPendingModelDTO {
    fn from(model: ProfileContactPendingModel) -> Self {
        ProfileContactPendingModelDTO {
            id: model.id.to_string(),
            user_id: model.user_id.to_string(),
            username: model.username,
            full_name: model.full_name,
            status: model.status,
        }
    }
}
// End: Profile Contact Lite Model