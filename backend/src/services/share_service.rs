use sonyflake::Sonyflake;
use sqlx::types::Uuid;

use crate::db::KosmosPool;
use crate::model::share::{ParsedShareModel, ShareModel, ShareType};
use crate::response::error_handling::AppError;
use crate::routes::api::v1::share::create::{ShareFilePublicRequest, ShareFolderPublicRequest};
use crate::services::folder_service::FolderService;
use crate::services::session_service::UserId;

#[derive(Clone)]
pub struct ShareService {
    db_pool: KosmosPool,
    sf: Sonyflake,
}

impl ShareService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        ShareService { db_pool, sf }
    }

    pub async fn get_file_shares(
        &self,
        file_id: i64,
        user_id: UserId,
    ) -> Result<Vec<ShareModel>, AppError> {
        sqlx::query_as!(
            ShareModel,
            "SELECT * FROM shares WHERE file_id = $1
            AND user_id = $2",
            file_id,
            user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting shares: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_folder_shares(
        &self,
        folder_id: i64,
        user_id: UserId,
    ) -> Result<Vec<ShareModel>, AppError> {
        sqlx::query_as!(
            ShareModel,
            "SELECT * FROM shares WHERE folder_id = $1
            AND user_id = $2",
            folder_id,
            user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting shares: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_public_share_by_type_file(
        &self,
        file_id: i64,
        user_id: UserId,
    ) -> Result<Option<ShareModel>, AppError> {
        sqlx::query_as!(
            ShareModel,
            "SELECT * FROM shares WHERE file_id = $1
            AND user_id = $2
            AND share_type = $3",
            file_id,
            user_id,
            ShareType::Public as i16
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting shares: {}", e);
            AppError::InternalError
        })
    }

    pub async fn is_any_folder_above_already_shared(
        &self,
        folder_id: i64,
        share_type: ShareType,
        share_target_id: Option<UserId>,
        folder_service: &FolderService,
    ) -> Result<bool, AppError> {
        let structure = folder_service
            .get_folder_structure_upwards_with_share(folder_id)
            .await?;

        if structure
            .iter()
            .filter_map(|shared_dir| {
                shared_dir
                    .share_type
                    .map(|dir_type| (dir_type, shared_dir.share_target))
            })
            .any(|(dir_type, share_target)| {
                dir_type == share_type as i16 && share_target == share_target_id
            })
        {
            return Ok(true);
        }

        Ok(false)
    }

    pub async fn is_folder_existing_under_share(
        &self,
        folder_id: i64,
        share_id: i64,
        folder_service: &FolderService,
    ) -> Result<bool, AppError> {
        let structure = folder_service
            .get_folder_structure_upwards_with_share(folder_id)
            .await?;

        if structure
            .iter()
            // Filter for folders which have the same share_id as given
            .filter(|shared_dir| shared_dir.share_id == Some(share_id))
            .count()
            > 0
        {
            return Ok(true);
        }

        Ok(false)
    }

    pub async fn get_private_share_by_target(
        &self,
        share_target_id: UserId,
        user_id: UserId,
    ) -> Result<Option<ShareModel>, AppError> {
        sqlx::query_as!(
            ShareModel,
            "SELECT * FROM shares WHERE share_target = $1
            AND user_id = $2
            AND share_type = $3",
            share_target_id,
            user_id,
            ShareType::Private as i16
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting shares: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_share(&self, share_uuid: &String) -> Result<ShareModel, AppError> {
        let share = sqlx::query_as!(
            ShareModel,
            "SELECT * FROM shares WHERE uuid = $1",
            Uuid::parse_str(share_uuid.as_str()).map_err(|_| {
                AppError::BadRequest {
                    error: Some("Invalid share ID".to_string()),
                }
            })?
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting share: {}", e);
            AppError::InternalError
        })?;

        if let Some(share) = share {
            Ok(share)
        } else {
            Err(AppError::NotFound {
                error: "Share not found".to_string(),
            })
        }
    }

    pub async fn create_public_file_share(
        &self,
        data: ShareFilePublicRequest,
        user_id: UserId,
    ) -> Result<ShareModel, AppError> {
        let share = sqlx::query_as!(
            ShareModel,
            "INSERT INTO shares
            (id, user_id, share_type, file_id, access_limit, password, expires_at)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *",
            self.sf.next_id().map_err(|e| {
                tracing::error!("Error creating share id: {}", e);
                AppError::InternalError
            })? as i64,
            user_id,
            ShareType::Public as i16,
            data.file_id,
            data.limit,
            data.password,
            data.expires_at
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error creating share: {}", e);
            AppError::InternalError
        })?;

        Ok(share)
    }

    pub async fn create_public_folder_share(
        &self,
        data: ShareFolderPublicRequest,
        user_id: UserId,
    ) -> Result<ShareModel, AppError> {
        let share = sqlx::query_as!(
            ShareModel,
            "INSERT INTO shares
            (id, user_id, share_type, folder_id, access_limit, password, expires_at)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *",
            self.sf.next_id().map_err(|e| {
                tracing::error!("Error creating share id: {}", e);
                AppError::InternalError
            })? as i64,
            user_id,
            ShareType::Public as i16,
            data.folder_id,
            data.limit,
            data.password,
            data.expires_at
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error creating share: {}", e);
            AppError::InternalError
        })?;

        Ok(share)
    }

    pub async fn create_private_file_share(
        &self,
        file_id: i64,
        user_id: UserId,
        share_target_id: UserId,
    ) -> Result<ShareModel, AppError> {
        sqlx::query_as!(
            ShareModel,
            "INSERT INTO shares
            (id, user_id, share_type, file_id, share_target)
            VALUES
            ($1, $2, $3, $4, $5)
            RETURNING *",
            self.sf.next_id().map_err(|e| {
                tracing::error!("Error creating share id: {}", e);
                AppError::InternalError
            })? as i64,
            user_id,
            ShareType::Private as i16,
            file_id,
            share_target_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error creating share: {}", e);
            AppError::InternalError
        })
    }

    pub async fn delete_share(&self, share_id: i64, user_id: UserId) -> Result<(), AppError> {
        sqlx::query!(
            "DELETE FROM shares WHERE id = $1 AND user_id = $2",
            share_id,
            user_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error deleting share: {}", e);
            AppError::InternalError
        })?;
        Ok(())
    }

    pub async fn update_access_limit(&self, share_id: &i64, new_uses: i32) -> Result<(), AppError> {
        sqlx::query!(
            "UPDATE shares SET access_limit = $1 WHERE id = $2",
            new_uses,
            share_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error updating share: {}", e);
            AppError::InternalError
        })?;
        Ok(())
    }

    pub async fn handle_share_access(&self, share_id: i64) {
        let _ = sqlx::query!(
            "UPDATE shares SET last_access = now() WHERE id = $1",
            share_id
        )
        .execute(&self.db_pool)
        .await;
    }

    pub fn parse_share(share_model: ShareModel) -> ParsedShareModel {
        ParsedShareModel {
            id: share_model.id.to_string(),
            uuid: share_model.uuid,
            user_id: share_model.user_id.to_string(),
            file_id: share_model.file_id.map(|id| id.to_string()),
            folder_id: share_model.folder_id.map(|id| id.to_string()),
            share_type: share_model.share_type,
            share_target: share_model.share_target,
            access_limit: share_model.access_limit,
            password: share_model.password,
            access_count: share_model.access_count,
            last_access: share_model.last_access,
            created_at: share_model.created_at,
            expires_at: share_model.expires_at,
            updated_at: share_model.updated_at,
        }
    }
}
