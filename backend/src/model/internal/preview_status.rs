use serde::Serialize;
use sqlx::Type;

#[repr(i16)]
#[derive(Clone, Debug, Copy, PartialEq, Type, Serialize)]
pub enum PreviewStatus {
    Unavailable = 0,
    Ready = 1,
    Failed = 2,
    Processing = 3,
}

impl From<i16> for PreviewStatus {
    fn from(num: i16) -> Self {
        Self::new(num)
    }
}

impl PreviewStatus {
    pub fn new(num: i16) -> Self {
        match num {
            1 => PreviewStatus::Ready,
            2 => PreviewStatus::Failed,
            3 => PreviewStatus::Processing,
            _ => PreviewStatus::Unavailable,
        }
    }
}
