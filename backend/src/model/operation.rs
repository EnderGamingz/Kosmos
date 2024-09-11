use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::types::JsonValue;
use sqlx::FromRow;
use ts_rs::TS;
use crate::model::internal::operation_status::OperationStatus;
use crate::model::internal::operation_type::OperationType;

// Start: Operation Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct OperationModel {
    pub id: i64,
    pub user_id: i64,
    pub operation_type: OperationType,
    pub operation_status: OperationStatus,
    pub metadata: Option<JsonValue>,
    pub result: Option<String>,
    pub started_at: DateTime<Utc>,
    pub ended_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct OperationModelDTO {
    pub id: String,
    pub user_id: String,
    pub operation_type: i16,
    pub operation_status: i16,
    pub result: Option<String>,
    pub started_at: DateTime<Utc>,
    pub ended_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
}

impl From<OperationModel> for OperationModelDTO {
    fn from(model: OperationModel) -> Self {
        OperationModelDTO {
            id: model.id.to_string(),
            user_id: model.user_id.to_string(),
            operation_type: model.operation_type as i16,
            operation_status: model.operation_status as i16,
            result: model.result,
            started_at: model.started_at,
            ended_at: model.ended_at,
            updated_at: model.updated_at,
        }
    }
}
// End: Operation Model
