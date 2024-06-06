use sonyflake::Sonyflake;

use crate::db::KosmosPool;
use crate::model::folder::{Directory, FolderModel, ParsedFolderModel, ParsedSimpleDirectory, SimpleDirectory};
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

    pub async fn move_folder(
        &self,
        user_id: UserId,
        folder_id: i64,
        new_parent_id: Option<i64>,
    ) -> Result<i64, AppError> {
        sqlx::query!(
            "UPDATE folder SET parent_id = $1 WHERE id = $2 AND user_id = $3 RETURNING id",
            new_parent_id,
            folder_id,
            user_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error moving folder {}: {}", folder_id, e);
            AppError::InternalError
        })
        .map(|row| row.id)
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

    pub async fn check_folder_exists_in_folder(
        &self,
        folder_name: &String,
        destination_folder_id: Option<i64>,
    ) -> Result<bool, AppError> {
        sqlx::query!("SELECT id FROM folder WHERE folder_name = $1 AND parent_id IS NOT DISTINCT FROM $2 LIMIT 1", folder_name, destination_folder_id)
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error checking if folder {} exists in folder {:?}: {}", folder_name, destination_folder_id, e);
                AppError::InternalError
            })
            .map(|row| row.is_some())
    }

    pub async fn rename_folder(
        &self,
        user_id: UserId,
        folder_id: i64,
        folder_name: String,
        parent_id: Option<i64>,
    ) -> Result<i64, AppError> {
        if self
            .check_folder_exists_in_folder(&folder_name, parent_id)
            .await?
        {
            return Err(AppError::DataConflict {
                error: "Folder already exists in this folder".to_string(),
            });
        }
        sqlx::query!(
            "UPDATE folder SET folder_name = $1 WHERE id = $2 AND user_id = $3 RETURNING id",
            &folder_name,
            folder_id,
            user_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error renaming folder {}: {}", folder_id, e);
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

    pub async fn check_folder_contains_elements(&self, folder_id: i64) -> Result<bool, AppError> {
        let result = sqlx::query!(
            "SELECT COUNT(*) FROM files WHERE parent_folder_id = $1 AND deleted_at IS NULL",
            folder_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!(
                "Error checking if folder {} contains elements: {}",
                folder_id,
                e
            );
            AppError::InternalError
        })?
        .count
        .unwrap_or(0);
        Ok(result > 0)
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

    pub async fn get_children_directories(
        &self,
        folder_id: i64,
        user_id: UserId,
    ) -> Result<Vec<SimpleDirectory>, AppError> {
        let children_res = sqlx::query_as::<_, SimpleDirectory>(
            "WITH RECURSIVE directories AS (
                    SELECT f.id,
                           f.folder_name,
                           f.parent_id,
                           ARRAY [f.id]::BIGINT[] AS path
                    FROM folder f
                    WHERE f.id = $1
                      AND f.user_id = $2
                    UNION ALL
                    SELECT f.id,
                           f.folder_name,
                           f.parent_id,
                           d.path || f.id
                    FROM folder f
                             JOIN directories d ON f.id = d.parent_id
                    WHERE array_length(d.path, 1) < 100
                )
                SELECT id, folder_name
                FROM directories
                ORDER BY array_length(path, 1) DESC",
        )
        .bind(folder_id)
        .bind(user_id)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting children directories: {}", e);
            AppError::InternalError
        })?;

        Ok(children_res)
    }

    pub fn parse_children_directory(children: SimpleDirectory) -> ParsedSimpleDirectory {
        ParsedSimpleDirectory {
            id: children.id.to_string(),
            folder_name: children.folder_name,
        }
    }

    pub async fn get_folder_structure(
        &self,
        folders: Vec<i64>,
        user_id: UserId,
    ) -> Result<Vec<Directory>, AppError> {
        let folders = folders.into_iter().collect::<Vec<_>>();
        let folder_res = sqlx::query_as::<_, Directory>(
            "WITH RECURSIVE directories AS (SELECT f.id,
                                      f.folder_name,
                                      f.user_id,
                                      ARRAY []::TEXT[] AS path
                               FROM folder f
                               WHERE f.id = ANY ($1) AND f.user_id = $2

                               UNION ALL

                               SELECT f.id,
                                      f.folder_name,
                                      f.user_id,
                                      d.path || d.folder_name
                               FROM folder f
                                        JOIN directories d ON f.parent_id = d.id)
        SELECT d.*,
               COALESCE(ARRAY_AGG(f.id) FILTER (WHERE f.id IS NOT NULL), ARRAY []::BIGINT[])             AS files,
               COALESCE(ARRAY_AGG(f.file_name) FILTER (WHERE f.file_name IS NOT NULL), ARRAY []::TEXT[]) AS file_names
        FROM directories d
                 LEFT JOIN files f ON f.parent_folder_id = d.id
        GROUP BY d.folder_name, d.user_id, d.id, d.path",
        ).bind(&folders)
        .bind(user_id)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting folder structure: {}", e);
            AppError::InternalError
        })?;

        Ok(folder_res)
    }
}
