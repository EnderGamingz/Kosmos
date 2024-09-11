use serde::Serialize;
use sqlx::Type;
use ts_rs::TS;

#[repr(i16)]
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Type, TS)]
#[ts(export)]
pub enum ShareType {
    Public = 0,
    Private = 1,
}

impl From<i16> for ShareType {
    fn from(num: i16) -> Self {
        Self::new(num)
    }
}

impl ShareType {
    pub fn new(num: i16) -> ShareType {
        match num {
            1 => ShareType::Private,
            _ => ShareType::Public,
        }
    }
}