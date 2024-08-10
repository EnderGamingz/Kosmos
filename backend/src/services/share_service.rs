use sonyflake::Sonyflake;
use sqlx::types::Uuid;
use sqlx::{Execute, QueryBuilder};

use crate::db::{KosmosDb, KosmosDbResult, KosmosPool};
use crate::model::album::AlbumModelWithShareInfo;
use crate::model::file::FileModelWithShareInfo;
use crate::model::folder::FolderModelWithShareInfo;
use crate::model::share::{ExtendedShareModel, ShareModel, ShareType};
use crate::response::error_handling::AppError;
use crate::routes::api::v1::share::create::{ShareAlbumPublicRequest, ShareFilePublicRequest, ShareFolderPublicRequest};
use crate::routes::api::v1::share::AccessShareItemType;
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
    ) -> Result<Vec<ExtendedShareModel>, AppError> {
        sqlx::query_as::<_, ExtendedShareModel>(
            "SELECT s.*,
               u.username as share_target_username
            FROM shares s
               LEFT JOIN users u on s.share_target = u.id
            WHERE file_id = $1
            AND user_id = $2
            ORDER BY updated_at DESC",
        )
        .bind(file_id)
        .bind(user_id)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting file shares: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_folder_shares(
        &self,
        folder_id: i64,
        user_id: UserId,
    ) -> Result<Vec<ExtendedShareModel>, AppError> {
        sqlx::query_as::<_, ExtendedShareModel>(
            "SELECT s.*,
               u.username as share_target_username
            FROM shares s
               LEFT JOIN users u on s.share_target = u.id
            WHERE folder_id = $1
            AND user_id = $2
            ORDER BY updated_at DESC",
        )
        .bind(folder_id)
        .bind(user_id)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting folder shares: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_album_shares(
        &self,
        album_id: i64,
        user_id: UserId,
    ) -> Result<Vec<ExtendedShareModel>, AppError> {
        sqlx::query_as::<_, ExtendedShareModel>(
            "SELECT s.*,
               u.username as share_target_username
            FROM shares s
               LEFT JOIN users u on s.share_target = u.id
            WHERE album_id = $1
            AND user_id = $2
            ORDER BY updated_at DESC",
        )
        .bind(album_id)
        .bind(user_id)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting album shares: {}", e);
            AppError::InternalError
        })
    }

    pub fn get_share_items_query(
        user_id: &UserId,
        share_type: AccessShareItemType,
        get_target: bool,
    ) -> String {
        let mut query: QueryBuilder<KosmosDb> = QueryBuilder::new(
            "SELECT DISTINCT ON (f.id) f.*, s.uuid as share_uuid, u.username as share_target_username",
        );

        match share_type {
            AccessShareItemType::File => query.push(
                " FROM files f
                INNER JOIN public.shares s on f.id = s.file_id",
            ),
            AccessShareItemType::Folder => query.push(
                " FROM folder f
                INNER JOIN public.shares s on f.id = s.folder_id",
            ),
        };
        query.push(" INNER JOIN public.users u on f.user_id = u.id");

        if get_target {
            query.push(" WHERE s.share_target = ");
        } else {
            query.push(" WHERE f.user_id = ");
        }

        query.push_bind(user_id);

        query.build().sql().into()
    }

    pub async fn get_shared_files(
        &self,
        user_id: &UserId,
        get_target: bool,
    ) -> Result<Vec<FileModelWithShareInfo>, AppError> {
        sqlx::query_as::<_, FileModelWithShareInfo>(&*Self::get_share_items_query(
            user_id,
            AccessShareItemType::File,
            get_target,
        ))
        .bind(user_id)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting shared files: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_shared_folders(
        &self,
        user_id: &UserId,
        get_target: bool,
    ) -> Result<Vec<FolderModelWithShareInfo>, AppError> {
        sqlx::query_as::<_, FolderModelWithShareInfo>(&*Self::get_share_items_query(
            user_id,
            AccessShareItemType::Folder,
            get_target,
        ))
        .bind(user_id)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting shared folders: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_shared_albums(
        &self,
        user_id: &UserId,
    )  -> Result<Vec<AlbumModelWithShareInfo>, AppError> {
        sqlx::query_as::<_, AlbumModelWithShareInfo>(
            "SELECT DISTINCT ON (a.id) a.*, s.uuid as share_uuid, u.username as share_target_username
                FROM albums a
                    INNER JOIN public.shares s
                ON a.id = s.album_id
                    INNER JOIN public.users u on a.user_id = u.id
                WHERE s.share_target = $1"
        )
        .bind(user_id)
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting shared albums: {}", e);
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
            tracing::error!("Error getting public file shares by type: {}", e);
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

    pub async fn get_private_file_share_by_target(
        &self,
        share_target_id: UserId,
        user_id: UserId,
        file_id: i64,
    ) -> Result<Option<ShareModel>, AppError> {
        sqlx::query_as!(
            ShareModel,
            "SELECT * FROM shares WHERE share_target = $1
            AND file_id = $2
            AND user_id = $3
            AND share_type = $4",
            share_target_id,
            file_id,
            user_id,
            ShareType::Private as i16
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting private shares by target: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_private_album_share_by_target(
        &self,
        share_target_id: UserId,
        user_id: UserId,
        album_id: i64,
    ) -> Result<Option<ShareModel>, AppError> {
        sqlx::query_as!(
            ShareModel,
            "SELECT * FROM shares WHERE share_target = $1
            AND album_id = $2
            AND user_id = $3
            AND share_type = $4",
            share_target_id,
            album_id,
            user_id,
            ShareType::Private as i16
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting private shares by target: {}", e);
            AppError::InternalError
        })
    }

    pub async fn get_share(&self, share_uuid: &String) -> Result<ExtendedShareModel, AppError> {
        let share = sqlx::query_as::<_, ExtendedShareModel>(
            "SELECT s.*,
               u.username as share_target_username
            FROM shares s
                 LEFT JOIN users u on s.share_target = u.id
            WHERE s.uuid = $1",
        )
        .bind(
            Uuid::parse_str(share_uuid.as_str()).map_err(|_| AppError::BadRequest {
                error: Some("Invalid share ID".to_string()),
            })?,
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting share by uuid: {}", e);
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

    pub async fn get_share_for_user(
        &self,
        share_id: i64,
        user_id: UserId,
    ) -> Result<ShareModel, AppError> {
        let share = sqlx::query_as!(
            ShareModel,
            "SELECT * FROM shares
            WHERE id = $1
            AND user_id = $2",
            share_id,
            user_id,
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error getting private shares by target: {}", e);
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

    pub async fn update_share_password(
        &self,
        share_id: i64,
        new_password: String,
    ) -> Result<KosmosDbResult, AppError> {
        sqlx::query!(
            "UPDATE shares SET password = $1 WHERE id = $2",
            new_password,
            share_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error updating share password: {}", e);
            AppError::InternalError
        })
    }

    pub async fn create_public_file_share(
        &self,
        file_id: i64,
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
            file_id,
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
        folder_id: i64,
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
            folder_id,
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

    pub async fn create_public_album_share(
        &self,
        album_id: i64,
        data: ShareAlbumPublicRequest,
        user_id: UserId,
    ) -> Result<ShareModel, AppError> {
        let share = sqlx::query_as!(
            ShareModel,
            "INSERT INTO shares
            (id, user_id, share_type, album_id, access_limit, password, expires_at)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *",
            self.sf.next_id().map_err(|e| {
                tracing::error!("Error creating share id: {}", e);
                AppError::InternalError
            })? as i64,
            user_id,
            ShareType::Public as i16,
            album_id,
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

    pub async fn create_private_folder_share(
        &self,
        folder_id: i64,
        user_id: UserId,
        share_target_id: UserId,
    ) -> Result<ShareModel, AppError> {
        sqlx::query_as!(
            ShareModel,
            "INSERT INTO shares
            (id, user_id, share_type, folder_id, share_target)
            VALUES
            ($1, $2, $3, $4, $5)
            RETURNING *",
            self.sf.next_id().map_err(|e| {
                tracing::error!("Error creating share id: {}", e);
                AppError::InternalError
            })? as i64,
            user_id,
            ShareType::Private as i16,
            folder_id,
            share_target_id
        )
        .fetch_one(&self.db_pool)
        .await
        .map_err(|e| {
            tracing::error!("Error creating share: {}", e);
            AppError::InternalError
        })
    }

    pub async fn create_private_album_share(
        &self,
        album_id: i64,
        user_id: UserId,
        share_target_id: UserId,
    ) -> Result<ShareModel, AppError> {
        sqlx::query_as!(
            ShareModel,
            "INSERT INTO shares
            (id, user_id, share_type, album_id, share_target)
            VALUES
            ($1, $2, $3, $4, $5)
            RETURNING *",
            self.sf.next_id().map_err(|e| {
                tracing::error!("Error creating share id: {}", e);
                AppError::InternalError
            })? as i64,
            user_id,
            ShareType::Private as i16,
            album_id,
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
}
