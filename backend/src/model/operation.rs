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
    pub fn get_type_by_id(num: i16) -> OperationType {
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
pub struct ParsedOperationModel {
    pub id: String,
    pub user_id: String,
    pub operation_type: i16,
    pub operation_status: i16,
    pub result: Option<String>,
    pub started_at: DateTime<Utc>,
    pub ended_at: Option<DateTime<Utc>>,
    pub updated_at: DateTime<Utc>,
}
