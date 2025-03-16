use serde::Serialize;
use sqlx::{Type};
use ts_rs::TS;

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Type, TS)]
#[ts(export)]
pub enum ChatType {
    Personal,
    Group,
}

impl ChatType {
    pub fn new(s: &str) -> ChatType {
        match s {
            "personal" => ChatType::Personal,
            "group" => ChatType::Group,
            _ => ChatType::Personal,
        }
    }
    pub fn to_string(&self) -> String {
        match self {
            ChatType::Personal => "personal".to_string(),
            ChatType::Group => "group".to_string(),
        }
    }
    pub fn from_string(s: &str) -> Option<Self> {
        match s {
            "personal" => Some(ChatType::Personal),
            "group" => Some(ChatType::Group),
            _ => None,
        }
    }
}

impl From<String> for ChatType {
    fn from(s: String) -> ChatType {
        match s.as_str() {
            "personal" => ChatType::Personal,
            "group" => ChatType::Group,
            _ => ChatType::Personal,
        }
    }
}

