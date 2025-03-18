use crate::model::chat::message::ChatMessageModelDTO;
use crate::model::operation::OperationModelDTO;
use serde::Serialize;
use ts_rs::TS;
use crate::model::internal::chat_type::ChatType;

#[derive(Serialize, Clone, TS)]
#[ts(export)]
pub struct PresenceNewChatMessage {
    pub chat_id: String,
    pub chat_type: ChatType,
    pub content: ChatMessageModelDTO,
}

#[derive(Serialize, Clone, TS)]
#[ts(export)]
pub struct PresenceDeletedChatMessage {
    pub chat_id: String,
    pub message_id: String,
}

#[derive(Serialize, Clone, TS)]
#[ts(export)]
pub struct PresenceUpdatedChatMessage {
    pub chat_id: String,
    pub message_id: String,
    pub content: ChatMessageModelDTO,
}

#[derive(Serialize, Clone, TS)]
#[ts(export)]
pub struct PresenceSocialUpdate {
    pub content: bool,
}

#[derive(Serialize, Clone, TS)]
#[ts(export)]
pub struct PresenceOperationsUpdate {
    pub content: Vec<OperationModelDTO>,
}