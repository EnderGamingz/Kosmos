use serde::Serialize;
use sqlx::Type;
use ts_rs::TS;

#[repr(i16)]
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Type, TS)]
#[ts(export)]
pub enum OperationStatus {
    Pending = 0,
    Success = 1,
    Failed = 2,
    Interrupted = 3,
    Unrecoverable = 4,
    Recovered = 5,
}

impl From<i16> for OperationStatus {
    fn from(num: i16) -> Self {
        Self::new(num)
    }
}

impl OperationStatus {
    pub fn new(num: i16) -> OperationStatus {
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
