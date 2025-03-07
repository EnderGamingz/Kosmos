use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use ts_rs::TS;

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
    pub user_id: i64,
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
            user_id: model.user_id,
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
