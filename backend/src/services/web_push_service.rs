use crate::db::KosmosPool;
use crate::model::push::PushSubscriptionModel;
use crate::response::error_handling::AppError;
use crate::services::session_service::UserId;
use web_push::{
    ContentEncoding, IsahcWebPushClient, SubscriptionInfo, VapidSignatureBuilder, WebPushClient,
    WebPushMessageBuilder,
};

#[derive(Clone)]
pub struct WebPushService {
    db_pool: KosmosPool,
    client: IsahcWebPushClient,
    private_key: String,
}

impl WebPushService {
    pub fn new(db_pool: KosmosPool, push_client: IsahcWebPushClient) -> Self {
        let private_key = std::env::var("PUSH_PRIVATE_BASE64")
            .expect("WebPushService error: PUSH_PRIVATE_BASE64 must be set");
        
        WebPushService {
            db_pool,
            client: push_client,
            private_key,
        }
    }

    pub async fn get_user_subscriptions(
        &self,
        user_id: UserId,
    ) -> Result<Vec<PushSubscriptionModel>, AppError> {
        sqlx::query_as!(
            PushSubscriptionModel,
            "SELECT * FROM push_subscriptions WHERE user_id = $1",
            user_id,
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching files by size: {}", e);
            AppError::InternalError
        })
    }

    pub async fn create_subscription(
        &self,
        user_id: UserId,
        endpoint: String,
        p256dh: String,
        auth: String,
        name: String,
    ) -> Result<PushSubscriptionModel, AppError> {
        let subscription = sqlx::query_as!(
            PushSubscriptionModel,
            "INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, name) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            user_id,
            endpoint,
            p256dh,
            auth,
            name
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error creating subscription: {}", e);
            AppError::InternalError
        })?;

        Ok(subscription)
    }

    pub async fn delete_subscription_by_user_id(
        &self,
        user_id: UserId,
        subscription_id: i64,
    ) -> Result<PushSubscriptionModel, AppError> {
        let subscription = sqlx::query_as!(
            PushSubscriptionModel,
            "DELETE FROM push_subscriptions WHERE id = $1 AND user_id = $2 RETURNING *",
            subscription_id,
            user_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error deleting subscription: {}", e);
            AppError::InternalError
        })?;

        Ok(subscription)
    }

    pub async fn send_push_notification(
        &self,
        user_id: UserId,
        payload: String,
    ) -> Result<u8, AppError> {
        let subscriptions = self.get_user_subscriptions(user_id).await?;
        let mut notification_count = 0;
        for subscription in subscriptions {
            let subscription_info = SubscriptionInfo::new(
                subscription.endpoint,
                subscription.p256dh,
                subscription.auth,
            );

            let signature =
                VapidSignatureBuilder::from_base64(self.private_key.as_str(), &subscription_info)
                    .map_err(|e| {
                        tracing::error!("Error creating VapidSignatureBuilder: {}", e);
                        AppError::InternalError
                    })?
                    .build()
                    .map_err(|e| {
                        tracing::error!("Error building VapidSignatureBuilder: {}", e);
                        AppError::InternalError
                    })?;

            let mut builder = WebPushMessageBuilder::new(&subscription_info);
            let content = payload.as_bytes();
            builder.set_payload(ContentEncoding::Aes128Gcm, content);
            builder.set_vapid_signature(signature);
            builder.set_ttl(24 * 60 * 60); // 1 day

            let notification = builder.build().map_err(|e| {
                tracing::error!("Error building WebPushMessage: {}", e);
                AppError::InternalError
            })?;

            match self.client.send(notification).await {
                Ok(_) => notification_count += 1,
                Err(e) => {
                    tracing::error!(
                        "Error sending notification to subscription {}: {}",
                        subscription.id,
                        e
                    );
                }
            }
        }

        Ok(notification_count)
    }
}
