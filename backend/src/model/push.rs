use crate::services::session_service::UserId;
use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use ts_rs::TS;

// Start: PushSubscription Model
#[derive(Clone, FromRow, Debug)]
pub struct PushSubscriptionModel {
    pub id: i64,
    pub user_id: UserId,
    pub name: Option<String>,
    pub endpoint: String,
    pub p256dh: String,
    pub auth: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct PushSubscriptionModelDTO {
    pub id: String,
    pub name: Option<String>,
    pub created_at: DateTime<Utc>,
}

impl From<PushSubscriptionModel> for PushSubscriptionModelDTO {
    fn from(model: PushSubscriptionModel) -> Self {
        PushSubscriptionModelDTO {
            id: model.id.to_string(),
            name: model.name,
            created_at: model.created_at,
        }
    }
}
// End: PushSubscription Model
