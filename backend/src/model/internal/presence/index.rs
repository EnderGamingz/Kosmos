use crate::model::internal::presence::messages::{PresenceDeletedChatMessage, PresenceExplorerUpdate, PresenceNewChatMessage, PresenceOperationsUpdate, PresenceSocialUpdate, PresenceUpdatedChatMessage};
use axum::extract::ws;
use serde::Serialize;
use ts_rs::TS;

#[derive(Clone, TS, Serialize)]
#[ts(export)]
pub enum PresenceAction {
    NewChatMessage(PresenceNewChatMessage),
    DeletedChatMessage(PresenceDeletedChatMessage),
    UpdatedChatMessage(PresenceUpdatedChatMessage),
    SocialUpdate(PresenceSocialUpdate),
    OperationsUpdate(PresenceOperationsUpdate),
    ExplorerUpdate(PresenceExplorerUpdate),
}

#[derive(Clone, TS, Serialize)]
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
