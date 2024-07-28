use std::path::Path;

use sqlx::{Execute, QueryBuilder};

use crate::db::{KosmosDb, KosmosPool};
use crate::model::file::{FileModel, FileType, PreviewStatus};
use crate::model::image::ImageFormatModel;
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::file::{
    GetFilesSortParams, GetRecentFilesParams, SortByFiles, SortOrder,
};
use crate::services::image_service::ImageService;
use crate::services::session_service::UserId;

#[derive(Clone)]
pub struct FileService {
    db_pool: KosmosPool,
}

impl FileService {
    pub fn new(db_pool: KosmosPool) -> Self {
        FileService { db_pool }
    }

    fn files_search_query(
        user_id: UserId,
        parent_folder_id: Option<i64>,
        with_deleted: bool,
        search: &GetFilesSortParams<SortByFiles>,
    ) -> String {
        let mut query: QueryBuilder<KosmosDb> =
            QueryBuilder::new("SELECT * FROM files WHERE user_id = ");
        query.push_bind(user_id);

        if with_deleted {
            query.push(" AND deleted_at IS NOT NULL");
        } else {
            query.push(" AND deleted_at IS NULL");
        }

        query.push(" AND parent_folder_id IS NOT DISTINCT FROM ");
        query.push_bind(parent_folder_id);

        let sort_by = search.get_sort_by();

        if sort_by == &SortByFiles::Name {
            query.push(" ORDER BY LOWER(file_name)");
        } else if sort_by == &SortByFiles::FileSize {
            query.push(" ORDER BY file_size");
        } else if sort_by == &SortByFiles::CreatedAt {
            query.push(" ORDER BY created_at");
        } else if sort_by == &SortByFiles::UpdatedAt {
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

        query.build().sql().into()
    }

    pub async fn get_files(
        &self,
        user_id: UserId,
        parent_folder_id: Option<i64>,
        with_deleted: bool,
        search: GetFilesSortParams<SortByFiles>,
    ) -> Result<Vec<FileModel>, AppError> {
        sqlx::query_as::<_, FileModel>(&*Self::files_search_query(
            user_id,
            parent_folder_id,
            with_deleted,
            &search,
        ))
        .bind(user_id)
        .bind(parent_folder_id)
        .bind(search.get_limit())
        .bind(search.get_page() * search.get_limit())
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting files for user {}: {}", user_id, e);
            AppError::InternalError
        })
        .map(|rows| rows.into_iter().map(FileModel::from).collect())
    }

    pub async fn get_files_by_file_type(
        &self,
        user_id: UserId,
        file_type: FileType,
        limit: i64,
        page: i64,
    ) -> Result<Vec<FileModel>, AppError> {
        sqlx::query_as!(
            FileModel,
            "SELECT * FROM files WHERE user_id = $1
             AND file_type = $2
             AND deleted_at IS NULL
             ORDER BY file_name ASC
             LIMIT $3 OFFSET $4",
            user_id,
            file_type as i16,
            limit,
            page * limit
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting files for user {}: {}", user_id, e);
            AppError::InternalError
        })
    }

    pub async fn get_files_for_share(
        &self,
        parent_folder_id: Option<i64>,
    ) -> Result<Vec<FileModel>, AppError> {
        sqlx::query_as!(
            FileModel,
            "SELECT * FROM files WHERE parent_folder_id = $1 AND deleted_at IS NULL",
            parent_folder_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting files for share: {}", e);
            AppError::InternalError
        })
        .map(|rows| rows.into_iter().map(FileModel::from).collect())
    }

    fn get_file_query(file_id: i64, user_id: Option<UserId>) -> String {
        let mut query: QueryBuilder<KosmosDb> =
            QueryBuilder::new("SELECT * FROM files WHERE id = ");
        query.push_bind(file_id);

        if user_id.is_some() {
            query.push(" AND user_id = ");
            query.push_bind(user_id);
        }

        query.build().sql().into()
    }

    pub async fn get_file(
        &self,
        file_id: i64,
        user_id: Option<UserId>,
    ) -> Result<FileModel, AppError> {
        let file = sqlx::query_as::<_, FileModel>(&*Self::get_file_query(file_id, user_id))
            .bind(file_id)
            .bind(user_id)
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error getting file {}: {}", file_id, e);
                AppError::InternalError
            })?;

        match file {
            None => Err(AppError::NotFound {
                error: "File not Found".to_string(),
            })?,
            Some(file) => Ok(file),
        }
    }

    pub async fn get_recent_files(
        &self,
        user_id: UserId,
        search: GetRecentFilesParams,
    ) -> Result<Vec<FileModel>, AppError> {
        sqlx::query_as!(
            FileModel,
            "SELECT * FROM files WHERE user_id = $1
             AND deleted_at IS NULL
             ORDER BY updated_at DESC
             LIMIT $2 OFFSET $3",
            user_id,
            search.get_limit(),
            search.get_page() * search.get_limit()
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting recent files for user {}: {}", user_id, e);
            AppError::InternalError
        })
        .map(|rows| rows.into_iter().map(FileModel::from).collect())
    }

    pub async fn get_files_for_user_delete(
        &self,
        user_id: UserId,
    ) -> Result<Vec<FileModel>, AppError> {
        sqlx::query_as!(
            FileModel,
            "SELECT * FROM files WHERE user_id = $1
             AND deleted_at IS NULL",
            user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching files for user {}: {}", user_id, e);
            AppError::InternalError
        })
        .map(|rows| rows.into_iter().map(FileModel::from).collect())
    }

    pub async fn get_marked_deleted_files(
        &self,
        user_id: UserId,
    ) -> Result<Vec<FileModel>, AppError> {
        sqlx::query_as!(
            FileModel,
            "SELECT * FROM files WHERE user_id = $1
             AND deleted_at IS NOT NULL
             ORDER BY deleted_at DESC",
            user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching deleted files: {}", e);
            AppError::InternalError
        })
    }

    pub async fn update_preview_status_for_file_ids(
        &self,
        file_ids: &Vec<i64>,
        preview_status: PreviewStatus,
    ) -> Result<(), AppError> {
        sqlx::query!(
            "UPDATE files SET preview_status = $1 WHERE id = ANY($2)",
            preview_status as i16,
            file_ids
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error updating preview status: {}", e);
            AppError::InternalError
        })?;

        Ok(())
    }

    pub async fn create_file(
        &self,
        user_id: UserId,
        file_id: i64,
        file_name: String,
        file_size: i64,
        file_type: FileType,
        mime_type: String,
        parent_folder_id: Option<i64>,
    ) -> Result<i64, AppError> {
        sqlx::query!(
            "INSERT INTO files (id, user_id, file_name, file_size, file_type, mime_type, parent_folder_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            file_id,
            user_id,
            file_name,
            file_size,
            file_type as i16,
            mime_type,
            parent_folder_id
        )
            .fetch_one(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error creating file {}: {}", file_id, e);
                AppError::InternalError
            })
            .map(|row| row.id)
    }

    /// Move file that is known to exist for the current user
    pub async fn move_file(
        &self,
        user_id: UserId,
        file_id: i64,
        parent_folder_id: Option<i64>,
    ) -> Result<i64, AppError> {
        sqlx::query!(
            "UPDATE files SET parent_folder_id = $1 WHERE id = $2 AND user_id = $3 RETURNING id",
            parent_folder_id,
            file_id,
            user_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error moving file {}: {}", file_id, e);
            AppError::InternalError
        })
        .map(|row| row.id)
    }

    pub async fn check_file_exists_in_folder(
        &self,
        file_name: &String,
        folder_id: Option<i64>,
    ) -> Result<bool, AppError> {
        sqlx::query!(
            "SELECT id FROM files WHERE file_name = $1 AND parent_folder_id is not distinct from $2",
            file_name,
            folder_id
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error checking if file {} exists in folder {:?}: {}", file_name, folder_id, e);
            AppError::InternalError
        })
        .map(|row| row.is_some())
    }

    pub async fn rename_file(
        &self,
        user_id: UserId,
        file_id: i64,
        file_name: String,
        parent_folder_id: Option<i64>,
    ) -> Result<i64, AppError> {
        if self
            .check_file_exists_in_folder(&file_name, parent_folder_id)
            .await?
        {
            return Err(AppError::DataConflict {
                error: "File already exists in folder".to_string(),
            });
        }
        sqlx::query!(
            "UPDATE files SET file_name = $1 WHERE id = $2 AND user_id = $3 RETURNING id",
            file_name,
            file_id,
            user_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error renaming file {}: {}", file_id, e);
            AppError::InternalError
        })
        .map(|row| row.id)
    }

    pub async fn check_file_exists_by_name(
        &self,
        file_name: &String,
        user_id: UserId,
        parent_folder_id: Option<i64>,
    ) -> Result<Option<i64>, AppError> {
        let result = sqlx::query!(
            "SELECT id FROM files WHERE file_name = $1
             AND user_id = $2
             AND parent_folder_id IS NOT DISTINCT FROM $3
             LIMIT 1",
            file_name,
            user_id,
            parent_folder_id
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error checking if file {} exists: {}", file_name, e);
            AppError::InternalError
        })?
        .map(|row| row.id);
        Ok(result)
    }

    pub async fn check_file_exists_by_id(
        &self,
        file_id: i64,
        user_id: UserId,
    ) -> Result<Option<FileModel>, AppError> {
        let result = sqlx::query_as!(
            FileModel,
            "SELECT * from files WHERE id = $1
             AND user_id = $2",
            file_id,
            user_id
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error checking if file {} exists: {}", file_id, e);
            AppError::InternalError
        })?;
        Ok(result)
    }

    pub async fn mark_file_for_deletion(
        &self,
        file_id: i64,
        user_id: UserId,
    ) -> Result<(), AppError> {
        sqlx::query!(
            "UPDATE files SET deleted_at = now() WHERE id = $1 AND user_id = $2",
            file_id,
            user_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error marking file {} for deletion: {}", file_id, e);
            AppError::InternalError
        })?;
        Ok(())
    }

    pub async fn restore_file(&self, file_id: i64) -> Result<(), AppError> {
        sqlx::query!("UPDATE files SET deleted_at = null WHERE id = $1", file_id)
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error restoring file {} from deletion: {}", file_id, e);
                AppError::InternalError
            })?;
        Ok(())
    }

    pub async fn mark_files_for_deletion(
        &self,
        file_ids: Vec<i64>,
        user_id: UserId,
    ) -> Result<(), AppError> {
        for file_id in file_ids {
            self.mark_file_for_deletion(file_id, user_id).await?;
        }
        Ok(())
    }

    pub async fn permanently_delete_file(
        &self,
        file_id: i64,
        file_type: Option<FileType>,
    ) -> Result<(), AppError> {
        let upload_location = std::env::var("UPLOAD_LOCATION").unwrap();
        let upload_path = Path::new(&upload_location);

        if let Some(FileType::Image) = file_type {
            self.delete_formats_from_file_id(file_id).await?;
        }

        tokio::fs::remove_file(upload_path.join(file_id.to_string()))
            .await
            .map_err(|e| {
                tracing::error!("Error deleting file {} from storage: {}", file_id, e);
                AppError::InternalError
            })?;

        sqlx::query!("DELETE FROM files WHERE id = $1", file_id)
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error deleting file {} from database: {}", file_id, e);
                AppError::InternalError
            })?;

        Ok(())
    }

    pub async fn delete_formats_from_file_id(&self, file_id: i64) -> Result<(), AppError> {
        let formats = sqlx::query_as!(
            ImageFormatModel,
            "SELECT * FROM image_formats WHERE file_id = $1",
            file_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error while deleting {} image formats: {}", file_id, e);
            AppError::InternalError
        })?
        .into_iter()
        .map(ImageFormatModel::from)
        .collect::<Vec<_>>();

        if formats.is_empty() {
            return Ok(());
        }

        let upload_location = std::env::var("UPLOAD_LOCATION").unwrap();
        let upload_path = Path::new(&upload_location);
        let formats_folder_path = upload_path.join("formats");

        for format in formats {
            let format_path = formats_folder_path
                .join(ImageService::make_image_format_name(file_id, format.format));

            // Delete image format from disk
            let _ = tokio::fs::remove_file(&format_path).await.map_err(|e| {
                tracing::error!("Error while deleting image format: {}", e);
            });

            // Delete image format from database
            let _ = sqlx::query!("DELETE FROM image_formats WHERE id = $1", format.id)
                .execute(&self.db_pool)
                .await
                .map_err(|e| {
                    tracing::error!("Error while deleting image format: {}", e);
                });
        }

        Ok(())
    }

    pub async fn clear_bin(&self, user_id: UserId) -> Result<(), AppError> {
        let files = sqlx::query!(
            "SELECT id, file_type FROM files WHERE user_id = $1 AND deleted_at IS NOT NULL",
            user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching deleted files: {}", e);
            AppError::InternalError
        })?;

        for file in files {
            self.permanently_delete_file(file.id, Some(FileType::by_id(file.file_type)))
                .await?;
        }
        Ok(())
    }

    pub async fn set_favorite(&self, file_id: i64, favorite: bool) -> Result<(), AppError> {
        sqlx::query!(
            "UPDATE files SET favorite = $1 WHERE id = $2",
            favorite,
            file_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error while setting file favorite: {}", e);
            AppError::InternalError
        })?;
        Ok(())
    }

    pub fn get_file_type(mime_type: &str) -> FileType {
        const TYPES: [(&'static str, FileType); 44] = [
            ("image/gif", FileType::Image),
            ("image/jpeg", FileType::Image),
            ("image/png", FileType::Image),
            ("image/x-icon", FileType::Image),
            ("image/svg+xml", FileType::RawImage),
            ("image/webp", FileType::RawImage),
            ("application/postscript", FileType::LargeImage),
            ("video/mp4", FileType::Video),
            ("video/webm", FileType::Video),
            ("video/ogg", FileType::Video),
            ("video/quicktime", FileType::Video),
            ("audio/mpeg", FileType::Audio),
            ("audio/ogg", FileType::Audio),
            ("audio/wav", FileType::Audio),
            ("audio/webm", FileType::Audio),
            ("audio/flac", FileType::Audio),
            ("audio/opus", FileType::Audio),
            ("text/css", FileType::Document),
            ("text/html", FileType::Document),
            ("text/javascript", FileType::Document),
            ("text/plain", FileType::Document),
            ("text/xml", FileType::Document),
            ("application/json", FileType::Document),
            ("application/pdf", FileType::Document),
            ("text/markdown", FileType::Document),
            ("text/x-python", FileType::Document),
            ("text/x-rust", FileType::Document),
            ("text/x-c", FileType::Document),
            ("text/x-java", FileType::Document),
            ("text/x-kotlin", FileType::Document),
            ("text/x-ruby", FileType::Document),
            ("text/x-swift", FileType::Document),
            ("application/x-zip-compressed", FileType::Archive),
            ("application/x-tar-compressed", FileType::Archive),
            ("application/x-rar-compressed", FileType::Archive),
            ("application/x-7z-compressed", FileType::Archive),
            ("application/zip", FileType::Archive),
            ("application/tar", FileType::Archive),
            ("application/rar", FileType::Archive),
            ("application-7z", FileType::Archive),
            ("application/x-bzip", FileType::Archive),
            ("application/x-bzip2", FileType::Archive),
            ("application/x-gzip", FileType::Archive),
            ("application/x-lzma", FileType::Archive),
        ];

        TYPES
            .iter()
            .find(|(mime, _)| mime == &mime_type)
            .map(|(_, file_type)| *file_type)
            .unwrap_or(FileType::Generic)
    }

    pub async fn startup_prepare(&self) {
        let _ = sqlx::query!(
            "UPDATE files SET preview_status = $1 WHERE preview_status = $2",
            PreviewStatus::Unavailable as i16,
            PreviewStatus::Processing as i16
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error preparing files for startup: {}", e);
            AppError::InternalError
        });
        tracing::info!("Prepared files for startup");
    }
}
