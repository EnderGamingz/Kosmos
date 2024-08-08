use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;

use crate::services::session_service::UserId;

// Start: Passkey Model
#[derive(Clone, FromRow, Debug)]
pub struct PasskeyModel {
    pub id: i32,
    pub user_id: UserId,
    pub name: String,
    pub credential_id: Vec<u8>,
    pub passkey: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct PasskeyModelDTO {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

impl From<PasskeyModel> for PasskeyModelDTO {
    fn from(model: PasskeyModel) -> Self {
        PasskeyModelDTO {
            id: model.id.to_string(),
            user_id: model.user_id.to_string(),
            name: model.name,
            created_at: model.created_at,
        }
    }
}

// End: Passkey Model
