use serde::Serialize;
use sqlx::Type;
use ts_rs::TS;

#[repr(i16)]
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Type, TS)]
#[ts(export)]
pub enum OperationType {
    General = 0,
    ImageProcessing = 1,
}

impl From<i16> for OperationType {
    fn from(num: i16) -> Self {
        Self::new(num)
    }
}

impl OperationType {
    pub fn new(num: i16) -> OperationType {
        match num {
            1 => OperationType::ImageProcessing,
            _ => OperationType::General,
        }
    }
}