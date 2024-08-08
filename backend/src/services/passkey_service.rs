use image::EncodableLayout;
use webauthn_rs::prelude::{CredentialID, Passkey};
use webauthn_rs::Webauthn;

use crate::db::{KosmosDbResult, KosmosPool};
use crate::model::passkey::PasskeyModel;
use crate::response::error_handling::AppError;
use crate::services::session_service::UserId;

#[derive(Clone)]
pub struct PasskeyService {
    db_pool: KosmosPool,
    pub webauthn: Webauthn,
}

impl PasskeyService {
    pub fn new(db_pool: KosmosPool, webauthn: Webauthn) -> Self {
        PasskeyService { db_pool, webauthn }
    }

    pub async fn get_passkeys(&self, user_id: UserId) -> Result<Vec<PasskeyModel>, AppError> {
        sqlx::query_as!(
            PasskeyModel,
            "SELECT * FROM passkeys WHERE user_id = $1",
            user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting passkeys: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_excluded_credentials(
        &self,
        user_id: UserId,
    ) -> Result<Vec<CredentialID>, AppError> {
        let rows = sqlx::query!(
            "SELECT credential_id FROM passkeys WHERE user_id = $1",
            user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting excluded credentials: {}", e);
            AppError::InternalError
        });

        rows.map(|r| {
            r.into_iter()
                .map(|r| CredentialID::from(r.credential_id))
                .collect()
        })
    }

    pub async fn create_passkey(
        &self,
        user_id: UserId,
        passkey: Passkey,
        name: String,
    ) -> Result<KosmosDbResult, AppError> {
        let id = passkey.clone();
        let id = id.cred_id().as_bytes();

        let json = serde_json::to_value(passkey).map_err(|e| {
            tracing::error!("Error serializing passkey: {}", e);
            AppError::InternalError
        })?;

        sqlx::query!(
            "INSERT INTO passkeys (user_id, name, credential_id, passkey) VALUES ($1, $2, $3, $4)",
            user_id,
            name,
            id,
            json
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error creating passkey: {}", e);
            AppError::InternalError
        })
    }

    pub async fn delete_passkey(
        &self,
        user_id: UserId,
        passkey_id: i32,
    ) -> Result<KosmosDbResult, AppError> {
        sqlx::query!(
            "DELETE FROM passkeys WHERE user_id = $1 AND id = $2",
            user_id,
            passkey_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error deleting passkey: {}", e);
            AppError::InternalError
        })
    }

    pub async fn rename_passkey(
        &self,
        user_id: UserId,
        passkey_id: i32,
        new_name: &String,
    ) -> Result<KosmosDbResult, AppError> {
        sqlx::query!(
            "UPDATE passkeys SET name = $1 WHERE user_id = $2 AND id = $3",
            new_name,
            user_id,
            passkey_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error renaming passkey: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_passkey_by_credential_id(
        &self,
        credential_id: &[u8],
    ) -> Result<Passkey, AppError> {
        let row = sqlx::query!(
            "SELECT passkey FROM passkeys WHERE credential_id = $1",
            credential_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting credentials: {}", e);
            AppError::InternalError
        })?;

        serde_json::from_value(row.passkey).map_err(|e| {
            tracing::error!("Error deserializing passkey: {}", e);
            AppError::InternalError
        })
    }
}
