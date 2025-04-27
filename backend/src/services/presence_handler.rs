use crate::model::internal::presence::index::PresenceMessage;
use crate::services::session_service::UserId;
use crate::services::web_push_service::WebPushService;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::mpsc;
use tokio::sync::Mutex;

#[derive(Debug)]
pub struct PresenceInstance {
    pub connection_id: String,
    pub sender: mpsc::Sender<PresenceMessage>,
}

#[derive(Clone)]
pub struct PresenceHandler {
    pub presence_users: Arc<Mutex<HashMap<UserId, Vec<PresenceInstance>>>>,
    pub web_push_service: WebPushService,
}

impl PresenceHandler {
    pub fn new(web_push_service: WebPushService) -> Self {
        Self {
            presence_users: Arc::new(Mutex::new(HashMap::new())),
            web_push_service,
        }
    }

    pub async fn broadcast_to_user(&self, user_id: UserId, message: PresenceMessage) {
        let presence_users = self.presence_users.lock().await;
        let online_users = presence_users.get(&user_id);

        if let Some(senders) = online_users {
            if senders.is_empty() && message.important {
                let _ = self
                    .web_push_service
                    .send_push_notification(user_id, message.clone().into())
                    .await;
                return;
            }
            for sender in senders {
                let _ = sender.sender.send(message.clone()).await.map_err(|e| {
                    tracing::error!(
                        "[Presence] Failed to send message to user {}: {:?}",
                        user_id,
                        e
                    )
                });
            }
        } else if message.important {
            let _ = self
                .web_push_service
                .send_push_notification(user_id, message.clone().into())
                .await;
        }
    }

    pub async fn is_user_connected(&self, user_id: UserId) -> bool {
        let presence_users = self.presence_users.lock().await;
        presence_users.contains_key(&user_id)
    }

    pub async fn add_user(
        &self,
        user_id: UserId,
        sender: mpsc::Sender<PresenceMessage>,
        connection_id: String,
    ) {
        let mut presence_users = self.presence_users.lock().await;
        presence_users
            .entry(user_id)
            .or_insert_with(Vec::new)
            .push(PresenceInstance {
                connection_id,
                sender,
            });
    }

    pub async fn remove_user_sender(&self, user_id: i64, connection_id: String) {
        let mut presence_users = self.presence_users.lock().await;
        if let Some(senders) = presence_users.get_mut(&user_id) {
            senders.retain(|sender| sender.connection_id != connection_id);
            if senders.is_empty() {
                presence_users.remove(&user_id);
            }
        } else {
            tracing::warn!("[Presence] User {} not found in presence_users", user_id);
        }
    }

    pub async fn remove_user(&self, user_id: UserId) {
        let mut presence_users = self.presence_users.lock().await;
        presence_users.remove(&user_id);
    }
}
