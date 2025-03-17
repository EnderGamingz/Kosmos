use serde::Serialize;
use sqlx::{Decode, Type};
use std::error::Error;
use sqlx::postgres::PgValueRef;
use ts_rs::TS;
use crate::db::KosmosDb;

#[derive(Clone, Copy, Debug, PartialEq, Serialize, TS)]
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
    pub fn from_str(s: &str) -> Result<Self, &'static str> {
        match s {
            "personal" => Ok(ChatType::Personal),
            "group" => Ok(ChatType::Group),
            _ => Err("Invalid ChatType"),
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

impl Type<KosmosDb> for ChatType {
    fn type_info() -> sqlx::postgres::PgTypeInfo {
        sqlx::postgres::PgTypeInfo::with_name("TEXT")
    }
}

impl<'r> Decode<'r, KosmosDb> for ChatType
where
    String: Decode<'r, KosmosDb>,
    String: Type<KosmosDb>,
    Option<String>: Decode<'r, KosmosDb>,
    Option<String>: Type<KosmosDb>,
{
    fn decode(value: PgValueRef<'r>) -> Result<Self, Box<dyn Error + 'static + Send + Sync>> {
        let value = <String as Decode<KosmosDb>>::decode(value)?;
        let chat_type = ChatType::from_string(&value);
        match chat_type {
            Some(chat_type) => Ok(chat_type),
            None => Err("Invalid ChatType".into()),
        }
    }
}