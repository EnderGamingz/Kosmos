use crate::db::{KosmosDbResult, KosmosPool};
use crate::model::album::AlbumModel;
use crate::model::file::FileModel;
use crate::response::error_handling::AppError;
use crate::services::session_service::UserId;
use sonyflake::Sonyflake;

#[derive(Clone)]
pub struct AlbumService {
    db_pool: KosmosPool,
    sf: Sonyflake,
}

impl AlbumService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        AlbumService { db_pool, sf }
    }

    pub async fn get_album_by_id(
        &self,
        user_id: UserId,
        album_id: i64,
    ) -> Result<AlbumModel, AppError> {
        let album = sqlx::query_as!(
            AlbumModel,
            "SELECT * FROM albums WHERE user_id = $1 AND id = $2",
            user_id,
            album_id
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting album {}: {}", album_id, e);
            AppError::InternalError
        })?;
        match album {
            Some(album) => Ok(album),
            None => Err(AppError::NotFound {
                error: format!("Album {} not found", album_id),
            }),
        }
    }

    pub async fn get_album_files(&self, album_id: i64) -> Result<Vec<FileModel>, AppError> {
        sqlx::query_as!(
            FileModel,
            "SELECT f.*
                FROM files_on_album sf
                INNER JOIN files f ON f.id = sf.file_id
                WHERE sf.album_id = $1",
            album_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting album {}: {}", album_id, e);
            AppError::InternalError
        })
    }

    pub async fn get_albums(&self, user_id: UserId) -> Result<Vec<AlbumModel>, AppError> {
        sqlx::query_as!(
            AlbumModel,
            "SELECT * FROM albums WHERE user_id = $1",
            user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting albums: {}", e);
            AppError::InternalError
        })
    }

    pub async fn add_file_to_album(
        &self,
        album_id: i64,
        file_id: i64,
    ) -> Result<KosmosDbResult, AppError> {
        sqlx::query!(
            "INSERT INTO files_on_album (album_id, file_id) VALUES ($1, $2)",
            album_id,
            file_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!(
                "Error adding image {} to album {}: {}",
                file_id,
                album_id,
                e
            );
            AppError::InternalError
        })
    }

    pub async fn get_associated_albums(
        &self,
        user_id: UserId,
        file_id: i64,
    ) -> Result<Vec<AlbumModel>, AppError> {
        sqlx::query_as!(
            AlbumModel,
            "SELECT a.*
                FROM files_on_album sf
                INNER JOIN albums a ON a.id = sf.album_id
                WHERE sf.file_id = $1 AND a.user_id = $2",
            file_id,
            user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting associated albums: {}", e);
            AppError::InternalError
        })
    }

    pub async fn remove_file_from_album(
        &self,
        album_id: i64,
        file_id: i64,
    ) -> Result<KosmosDbResult, AppError> {
        sqlx::query!(
            "DELETE FROM files_on_album WHERE album_id = $1 AND file_id = $2",
            album_id,
            file_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!(
                "Error removing image {} from album {}: {}",
                file_id,
                album_id,
                e
            );
            AppError::InternalError
        })
    }

    pub async fn create_album(
        &self,
        user_id: UserId,
        album_name: String,
        album_description: Option<String>,
    ) -> Result<AlbumModel, AppError> {
        let id = self.sf.next_id().map_err(|_| AppError::InternalError)? as i64;
        sqlx::query_as!(
            AlbumModel,
            "INSERT INTO albums (id, user_id, name, description) VALUES ($1, $2, $3, $4) RETURNING *",
            id,
            user_id,
            album_name,
            album_description
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error creating album {}: {}", album_name, e);
            AppError::InternalError
        })
    }

    pub async fn update_album(
        &self,
        user_id: UserId,
        album_id: i64,
        album_name: String,
        album_description: Option<String>,
    ) -> Result<KosmosDbResult, AppError> {
        sqlx::query!(
            "UPDATE albums SET name = $1, description = $2 WHERE user_id = $3 AND id = $4",
            album_name,
            album_description,
            user_id,
            album_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error updating album {}: {}", album_name, e);
            AppError::InternalError
        })
    }

    pub async fn delete_album(
        &self,
        user_id: UserId,
        album_id: i64,
    ) -> Result<KosmosDbResult, AppError> {
        sqlx::query!(
            "DELETE FROM albums WHERE user_id = $1 AND id = $2",
            user_id,
            album_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error deleting album {}: {}", album_id, e);
            AppError::InternalError
        })
    }
}
