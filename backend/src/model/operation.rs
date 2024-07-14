use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::types::JsonValue;
use sqlx::FromRow;

#[repr(i16)]
#[derive(Clone, Copy, PartialEq)]
pub enum OperationType {
    General = 0,
    ImageProcessing = 1,
}

impl OperationType {
    pub fn by_id(num: i16) -> OperationType {
        match num {
            1 => OperationType::ImageProcessing,
            _ => OperationType::General,
        }
    }
}

#[repr(i16)]
#[derive(Clone, Copy, PartialEq)]
pub enum OperationStatus {
    Pending = 0,
    Success = 1,
    Failed = 2,
    Interrupted = 3,
    Unrecoverable = 4,
    Recovered = 5,
}

impl OperationStatus {
    pub fn get_status_by_id(num: i16) -> OperationStatus {
        match num {
            1 => OperationStatus::Success,
            2 => OperationStatus::Failed,
            3 => OperationStatus::Interrupted,
            4 => OperationStatus::Unrecoverable,
            5 => OperationStatus::Recovered,
            _ => OperationStatus::Pending,
        }
    }
}


// Start: Operation Model
#[derive(Clone, FromRow, Debug, Serialize)]
pub struct OperationModel {
    pub id: i64,
    pub user_id: i64,
    pub operation_type: i16,
    pub operation_status: i16,
    pub metadata: Option<JsonValue>,
    pub result: Option<String>,
    pub started_at: DateTime<Utc>,
    pub ended_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
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
            operation_type: model.operation_type,
            operation_status: model.operation_status,
            result: model.result,
            started_at: model.started_at,
            ended_at: model.ended_at,
            updated_at: model.updated_at,
        }
    }
}

// End: Operation Model
