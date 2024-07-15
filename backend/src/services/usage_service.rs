use crate::db::{KosmosDb, KosmosPool};
use crate::model::file::FileModel;
use crate::model::usage::{FileTypeSumData, UsageSumData};
use crate::response::error_handling::AppError;
use crate::services::session_service::UserId;
use sqlx::{Execute, QueryBuilder};

#[derive(Clone)]
pub struct UsageService {
    db_pool: KosmosPool,
}

impl UsageService {
    pub fn new(db_pool: KosmosPool) -> Self {
        UsageService { db_pool }
    }

    fn get_storage_query(user_id: UserId, marked_deleted: Option<bool>) -> String {
        let mut query: QueryBuilder<KosmosDb> =
            QueryBuilder::new("SELECT SUM(file_size), COUNT(id) FROM files WHERE user_id = ");
        query.push_bind(user_id);

        if let Some(bool) = marked_deleted {
            if bool {
                query.push(" AND deleted_at IS NOT NULL");
            } else {
                query.push(" AND deleted_at IS NULL");
            }
        }

        query.build().sql().into()
    }

    pub async fn get_user_storage_usage(
        &self,
        user_id: UserId,
        marked_deleted: Option<bool>,
    ) -> Result<UsageSumData, AppError> {
        sqlx::query_as::<_, UsageSumData>(&*Self::get_storage_query(user_id, marked_deleted))
            .bind(user_id)
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error fetching user storage usage: {}", e);
                AppError::InternalError
            })
    }

    pub async fn get_file_type_stats(
        &self,
        user_id: UserId,
        limit: i64,
    ) -> Result<Vec<FileTypeSumData>, AppError> {
        sqlx::query_as!(
            FileTypeSumData,
            "SELECT file_type, SUM(file_size), COUNT(id)
                FROM files
                WHERE user_id = $1
                GROUP BY file_type
                ORDER BY SUM(file_size) DESC LIMIT $2",
            user_id,
            limit
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching file type stats: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_files_by_size(
        &self,
        user_id: UserId,
        limit: i64,
    ) -> Result<Vec<FileModel>, AppError> {
        sqlx::query_as!(
            FileModel,
            "SELECT * FROM files WHERE user_id = $1 AND deleted_at IS NULL ORDER BY file_size DESC LIMIT $2",
            user_id,
            limit
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching files by size: {}", e);
            AppError::InternalError
        })
    }
}
