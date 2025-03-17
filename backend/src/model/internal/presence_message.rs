use axum::extract::ws;
use serde::Serialize;
use ts_rs::TS;

pub struct PresenceChatMessage {
    pub id: i64,
    pub content: String,
}

pub struct PresenceSocialUpdate {
    pub id: i64,
    pub content: String,
}

#[derive(Debug, Clone, PartialEq, Eq, TS, Serialize)]
#[ts(export)]
pub enum PresenceAction {
    PresenceChatMessage,
    PresenceSocialUpdate,
    PresenceOperationsUpdate,
}

#[derive(Debug, Clone, PartialEq, Eq, TS, Serialize)]
#[ts(export)]
pub struct PresenceMessage {
    pub action: PresenceAction,
}

impl From<PresenceMessage> for ws::Message {
    fn from(message: PresenceMessage) -> Self {
        let message = serde_json::to_string(&message).unwrap();
        ws::Message::Text(message)
    }
}
