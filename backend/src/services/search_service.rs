use crate::db::KosmosPool;
use crate::model::file::{FileModel, FileModelDTO};
use crate::model::folder::{FolderModel, FolderModelDTO};
use crate::response::error_handling::AppError;
use crate::services::session_service::UserId;
use serde::Serialize;

#[derive(Clone)]
pub struct SearchService {
    db_pool: KosmosPool,
}

pub struct ExplorerSearchResponse {
    pub files: Vec<FileModel>,
    pub folders: Vec<FolderModel>,
}

#[derive(Serialize)]
pub struct ExplorerSearchDTO {
    pub files: Vec<FileModelDTO>,
    pub folders: Vec<FolderModelDTO>,
}

impl SearchService {
    pub fn new(db_pool: KosmosPool) -> Self {
        SearchService { db_pool }
    }

    pub async fn search_files(
        &self,
        user_id: &UserId,
        query: &String,
    ) -> Result<Vec<FileModel>, AppError> {
        sqlx::query_as!(
            FileModel,
            "SELECT *
            FROM files
            WHERE user_id = $1
              AND deleted_at IS NULL
              AND file_name
                ILIKE '%' || $2 || '%'
            ORDER BY updated_at DESC
            LIMIT 25",
            user_id,
            query
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Failed to search files: {}", e);
            AppError::InternalError
        })
    }

    pub async fn search_folders(
        &self,
        user_id: &UserId,
        query: &String,
    ) -> Result<Vec<FolderModel>, AppError> {
        sqlx::query_as!(
            FolderModel,
            "SELECT *
            FROM folder
            WHERE user_id = $1
            AND folder_name
                ILIKE '%' || $2 || '%'
            ORDER BY updated_at DESC
            LIMIT 25",
            user_id,
            query
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Failed to search folders: {}", e);
            AppError::InternalError
        })
    }

    pub async fn search_explorer(
        &self,
        user_id: UserId,
        query: String,
    ) -> Result<ExplorerSearchResponse, AppError> {
        if query.is_empty() {
            return Ok(ExplorerSearchResponse {
                files: vec![],
                folders: vec![],
            });
        };

        Ok(ExplorerSearchResponse {
            files: self.search_files(&user_id, &query).await?,
            folders: self.search_folders(&user_id, &query).await?,
        })
    }
}
