use sonyflake::Sonyflake;
use sqlx::QueryBuilder;

use crate::db::{KosmosDb, KosmosPool};
use crate::model::folder::{
    DeletionDirectory, Directory, DirectoryWithShare, FolderModel, SimpleDirectory
};
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::file::{GetFilesSortParams, SortOrder};
use crate::routes::api::v1::auth::folder::SortByFolders;
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

    fn folder_search_query(
        user_id: UserId,
        parent_id: Option<i64>,
        search: &GetFilesSortParams<SortByFolders>,
    ) -> String {
        let mut query: QueryBuilder<KosmosDb> =
            QueryBuilder::new("SELECT * FROM folder WHERE user_id = ");
        query.push_bind(user_id);

        query.push(" AND parent_id IS NOT DISTINCT FROM ");
        query.push_bind(parent_id);

        let sort_by = search.get_sort_by();

        if sort_by == &SortByFolders::Name {
            query.push(" ORDER BY LOWER(folder_name)");
        } else if sort_by == &SortByFolders::CreatedAt {
            query.push(" ORDER BY created_at");
        } else if sort_by == &SortByFolders::UpdatedAt {
            query.push(" ORDER BY updated_at");
        }


        let search_order = search.get_sort_order();

        if search_order == &SortOrder::Asc {
            query.push(" ASC");
        } else {
            query.push(" DESC");
        }


        query.push(" LIMIT ");
        query.push_bind(search.get_limit());

        query.push(" OFFSET ");
        query.push_bind(search.get_page() * search.get_limit());

        query.sql().into()
    }

    pub async fn get_folders(
        &self,
        user_id: UserId,
        parent_id: Option<i64>,
        search: GetFilesSortParams<SortByFolders>,
    ) -> Result<Vec<FolderModel>, AppError> {
        sqlx::query_as::<_, FolderModel>(&*Self::folder_search_query(user_id, parent_id, &search))
            .bind(user_id)
            .bind(parent_id)
            .bind(search.get_limit())
            .bind(search.get_page())
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error getting folders for user {}: {}", user_id, e);
                AppError::InternalError
            })
            .map(|rows| rows.into_iter().map(FolderModel::from).collect())
    }

    pub async fn get_folders_for_share(
        &self,
        parent_id: &Option<i64>,
    ) -> Result<Vec<FolderModel>, AppError> {
        sqlx::query_as::<_, FolderModel>(
            "SELECT * FROM folder WHERE parent_id IS NOT DISTINCT FROM $1",
        )
        .bind(parent_id)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting folders for share: {}", e);
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

    pub async fn get_deletion_directories(
        &self,
        folder_id: i64,
        user_id: UserId,
    ) -> Result<Vec<DeletionDirectory>, AppError> {
        let structure = sqlx::query_as::<_, DeletionDirectory>(
            "WITH RECURSIVE directories AS (SELECT f.id,
                                      ARRAY []::BIGINT[] AS id_path
                               FROM folder f
                               WHERE f.id = $1
                                 AND f.user_id = $2
                               UNION ALL
                               SELECT f.id,
                                      d.id_path || d.id
                               FROM folder f
                                        JOIN directories d ON f.parent_id = d.id)
                    SELECT d.*,
                           COALESCE(ARRAY_AGG(f.id) FILTER (WHERE f.id IS NOT NULL), ARRAY []::BIGINT[])                 AS file_ids,
                           COALESCE(ARRAY_AGG(f.file_type) FILTER (WHERE f.file_type IS NOT NULL), ARRAY []::SMALLINT[]) AS file_types
                    FROM directories d
                             LEFT JOIN files f ON f.parent_folder_id = d.id
                    GROUP BY d.id_path, d.id
                    ORDER BY CASE
                 WHEN ARRAY_LENGTH(d.id_path, 1) IS NULL THEN 1
                 ELSE 0 END, ARRAY_LENGTH(d.id_path, 1) DESC",
        ).bind(folder_id)
            .bind(user_id)
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error getting folder structure: {}", e);
                AppError::InternalError
            })?;

        Ok(structure)
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

    pub async fn delete_all_folders(&self, user_id: UserId) -> Result<(), AppError> {
        sqlx::query!("DELETE FROM folder WHERE user_id = $1", user_id)
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error deleting all folders for user {}: {}", user_id, e);
                AppError::InternalError
            })
            .map(|_| ())
    }

    pub fn parent_directories_query(
        folder_id: i64,
        user_id: Option<UserId>,
        stop: Option<i64>,
    ) -> String {
        let mut query: QueryBuilder<KosmosDb> = QueryBuilder::new(
            "WITH RECURSIVE directories AS (
                    SELECT f.id,
                           f.folder_name,
                           f.parent_id,
                           ARRAY [f.id]::BIGINT[] AS path
                    FROM folder f
                    WHERE f.id = ",
        );
        query.push_bind(folder_id);

        if let Some(user_id) = user_id {
            query.push(" AND f.user_id = ");
            query.push_bind(user_id);
        } else {
            // Will always return true but is needed as the query returns unexpected results otherwise
            query.push(" AND ");
            query.push_bind(user_id);
            query.push(" IS NULL");
        }

        query.push(
            " UNION ALL
                    SELECT f.id,
                           f.folder_name,
                           f.parent_id,
                           d.path || f.id
                    FROM folder f
                             JOIN directories d ON f.id = d.parent_id
                    WHERE array_length(d.path, 1) < 100",
        );

        if let Some(stop) = stop {
            query.push(" AND f.id >= ");
            query.push_bind(stop);
        }

        query.push(
            " ) SELECT id, folder_name
                FROM directories
                ORDER BY array_length(path, 1) DESC",
        );

        query.sql().into()
    }

    pub async fn get_parent_directories(
        &self,
        folder_id: i64,
        user_id: Option<UserId>,
        stop: Option<i64>,
    ) -> Result<Vec<SimpleDirectory>, AppError> {
        let string = Self::parent_directories_query(folder_id, user_id, stop);
        let children_res = sqlx::query_as::<_, SimpleDirectory>(&*string)
            .bind(folder_id)
            .bind(user_id)
            .bind(stop)
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error getting parent directories: {}", e);
                AppError::InternalError
            })?;

        Ok(children_res)
    }

    pub fn folder_structure_query(folder_ids: &Vec<i64>, user_id: Option<UserId>) -> String {
        let mut query: QueryBuilder<KosmosDb> = QueryBuilder::new(
            "WITH RECURSIVE directories AS (SELECT f.id,
                                      f.folder_name,
                                      f.user_id,
                                      ARRAY []::TEXT[] AS path
                               FROM folder f
                               WHERE f.id = ANY (",
        );
        query.push_bind(folder_ids);
        query.push(")");

        if let Some(user_id) = user_id {
            query.push(" AND f.user_id = ");
            query.push_bind(user_id);
        } else {
            // Will always return true but is needed as the query returns unexpected results otherwise
            query.push(" AND ");
            query.push_bind(user_id);
            query.push(" IS NULL");
        }

        query.push(
            " UNION ALL
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
        GROUP BY d.folder_name, d.user_id, d.id, d.path"
        );

        query.sql().into()
    }

    pub async fn get_folder_structure(
        &self,
        folders: Vec<i64>,
        user_id: Option<UserId>,
    ) -> Result<Vec<Directory>, AppError> {
        let folders = folders.into_iter().collect::<Vec<_>>();
        let folder_res =
            sqlx::query_as::<_, Directory>(&*Self::folder_structure_query(&folders, user_id))
                .bind(&folders)
                .bind(user_id)
                .fetch_all(&self.db_pool)
                .await
                .map_err(|e| {
                    tracing::error!("Error getting folder structure: {}", e);
                    AppError::InternalError
                })?;

        Ok(folder_res)
    }

    pub async fn get_folder_structure_upwards_with_share(
        &self,
        folder_id: i64,
    ) -> Result<Vec<DirectoryWithShare>, AppError> {
        let folder_res = sqlx::query_as::<_, DirectoryWithShare>(
            "WITH RECURSIVE directories AS (SELECT f.id,
                                      f.folder_name,
                                      f.user_id,
                                      f.parent_id,
                                      ARRAY []::TEXT[] AS path
                               FROM folder f
                               WHERE f.id = $1

                               UNION ALL

                               SELECT f.id,
                                      f.folder_name,
                                      f.user_id,
                                      f.parent_id,
                                      array_append(d.path, d.folder_name)
                               FROM folder f
                                        JOIN directories d ON f.id = d.parent_id)
            SELECT d.*,
                s.id AS share_id,
                s.share_type AS share_type,
                s.share_target As share_target
            FROM directories d
                     LEFT JOIN files f ON f.parent_folder_id = d.id
                     LEFT JOIN shares s ON s.folder_id = d.id
            GROUP BY d.folder_name, d.user_id, d.id, d.path, d.parent_id, share_id, share_type,share_target
            ORDER BY d.path",
        )
        .bind(folder_id)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting upwards folder structure: {}", e);
            AppError::InternalError
        })?;

        Ok(folder_res)
    }

    pub async fn set_favorite(&self, folder_id: i64, favorite: bool) -> Result<(), AppError> {
        sqlx::query!(
            "UPDATE folder SET favorite = $1 WHERE id = $2",
            favorite,
            folder_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error while setting folder favorite: {}", e);
            AppError::InternalError
        })?;
        Ok(())
    }
}
