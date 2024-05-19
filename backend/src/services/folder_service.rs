use sonyflake::Sonyflake;

use crate::db::KosmosPool;
use crate::model::folder::{FolderModel, ParsedFolderModel};
use crate::response::error_handling::AppError;
use crate::services::session_service::UserId;

#[derive(Clone)]
pub struct FolderService {
    db_pool: KosmosPool,
    sf: Sonyflake,
}

impl FolderService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        FolderService { db_pool, sf }
    }

    pub async fn get_folders(
        &self,
        user_id: UserId,
        parent_id: Option<i64>,
    ) -> Result<Vec<FolderModel>, AppError> {
        sqlx::query_as!(
            FolderModel,
            "SELECT * FROM folder WHERE user_id = $1 AND parent_id IS NOT DISTINCT FROM $2",
            user_id,
            parent_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting folders for user {}: {}", user_id, e);
            AppError::InternalError
        })
        .map(|rows| rows.into_iter().map(FolderModel::from).collect())
    }

    pub async fn get_folder(&self, folder_id: i64) -> Result<FolderModel, AppError> {
        sqlx::query_as!(FolderModel, "SELECT * FROM folder WHERE id = $1", folder_id)
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error getting folder {}: {}", folder_id, e);
                AppError::NotFound {
                    error: "Folder not found".to_string(),
                }
            })
    }

    pub fn parse_folder(folder: FolderModel) -> ParsedFolderModel {
        ParsedFolderModel {
            id: folder.id.to_string(),
            user_id: folder.user_id.to_string(),
            folder_name: folder.folder_name,
            parent_id: folder.parent_id.map(|x| x.to_string()),
            created_at: folder.created_at,
            updated_at: folder.updated_at,
        }
    }

    pub async fn create_folder(
        &self,
        user_id: UserId,
        folder_name: String,
        parent_id: Option<i64>,
    ) -> Result<i64, AppError> {
        let id = self.sf.next_id().map_err(|_| AppError::InternalError)? as i64;
        sqlx::query!(
            "INSERT INTO folder (id, user_id, folder_name, parent_id) VALUES ($1, $2, $3, $4) RETURNING id",
            id,
            user_id,
            folder_name,
            parent_id
        )
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error creating folder {}: {}", folder_name, e);
                AppError::InternalError
            })
            .map(|row| row.id)
    }

    pub async fn check_folder_exists_by_name(
        &self,
        folder_name: &String,
        user_id: UserId,
        parent_folder_id: Option<i64>,
    ) -> Result<Option<i64>, AppError> {
        let result = sqlx::query!(
            "SELECT id FROM folder WHERE folder_name = $1 AND user_id = $2 AND parent_id IS NOT DISTINCT FROM $3 LIMIT 1",
            folder_name,
            user_id,
            parent_folder_id
        )
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error checking if folder {} exists: {}", folder_name, e);
                AppError::InternalError
            })?
            .map(|row| row.id);
        Ok(result)
    }

    pub async fn check_folder_exists_by_id(
        &self,
        folder_id: i64,
        user_id: UserId,
    ) -> Result<Option<FolderModel>, AppError> {
        let result = sqlx::query_as!(
            FolderModel,
            "SELECT * from folder WHERE id = $1 AND user_id = $2",
            folder_id,
            user_id
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error checking if folder {} exists: {}", folder_id, e);
            AppError::InternalError
        })?
        .map(FolderModel::from);
        Ok(result)
    }

    pub async fn delete_folder(&self, folder_id: i64) -> Result<(), AppError> {
        sqlx::query!("DELETE FROM folder WHERE id = $1", folder_id)
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error deleting folder {}: {}", folder_id, e);
                AppError::InternalError
            })
            .map(|_| ())
    }
}
