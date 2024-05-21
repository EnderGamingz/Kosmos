use crate::db::KosmosPool;
use crate::model::file::FileType;
use crate::model::image::{ImageFormat, ImageFormatModel, IMAGE_FORMATS};
use crate::response::error_handling::AppError;
use photon_rs::native::open_image_from_bytes;
use photon_rs::transform::SamplingFilter;
use photon_rs::PhotonImage;
use sonyflake::Sonyflake;
use std::path::Path;

#[derive(Clone)]
pub struct ImageService {
    db_pool: KosmosPool,
    sf: Sonyflake,
}

impl ImageService {
    pub fn new(db_pool: KosmosPool, sf: Sonyflake) -> Self {
        ImageService { db_pool, sf }
    }

    pub fn make_image_format_name(id: i64, format: i16) -> String {
        format!("{}_{}", id, format).as_str().to_string()
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
            let format_path =
                formats_folder_path.join(Self::make_image_format_name(file_id, format.format));

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

    pub async fn generate_image_sizes(&self, file_id: i64) -> Result<(), AppError> {
        // Setting limit to ~50MB
        const FILE_SIZE_LIMIT: i32 = 50 * 1024 * 1024;
        let upload_location = std::env::var("UPLOAD_LOCATION").unwrap();

        let original_image_path = Path::new(&upload_location).join(file_id.to_string());
        let original_image_path_str = original_image_path.to_str().unwrap();

        let image_formats_path = Path::new(&upload_location).join("formats");
        let image_formats_path_str = image_formats_path.to_str().unwrap();

        let file = tokio::fs::File::open(original_image_path_str)
            .await
            .map_err(|e| {
                tracing::error!("Error while opening image file {}: {}", file_id, e);
                AppError::NotFound {
                    error: "Error while trying to open image file".to_string(),
                }
            })?;

        let metadata = file.metadata().await.map_err(|e| {
            tracing::error!("Error while getting metadata for {}: {}", file_id, e);
            AppError::InternalError
        })?;

        let size = metadata.len() as i32;

        // Skip generating image sizes if file is too large
        if size > FILE_SIZE_LIMIT {
            tracing::warn!(
                "File {} is too large, skipping generating image sizes: {}",
                file_id,
                size
            );
            sqlx::query!(
                "UPDATE files SET file_type = $1 WHERE id = $2",
                FileType::LargeImage as i16,
                file_id
            )
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error updating file {} type: {}", file_id, e);
                AppError::InternalError
            })?;

            return Ok(());
        };

        let image_bytes = tokio::fs::read(original_image_path_str)
            .await
            .map_err(|e| {
                tracing::error!("Error while reading image file {}: {}", file_id, e);
                AppError::NotFound {
                    error: "Error while trying to read image file".to_string(),
                }
            })?;

        let image = open_image_from_bytes(&*image_bytes).unwrap();

        for format in IMAGE_FORMATS {
            self.generate_image_size(file_id, format, &image_formats_path_str, &image)
                .await?;
        }

        Ok(())
    }

    async fn generate_image_size(
        &self,
        file_id: i64,
        format: ImageFormat,
        formats_folder_path: &str,
        image: &PhotonImage,
    ) -> Result<(), AppError> {
        let format_width = ImageFormat::get_width_by_format(format);

        let format = format as i16;

        let aspect_ratio = image.get_width() as f32 / image.get_height() as f32;
        let format_height = (format_width as f32 / aspect_ratio) as i32;

        let resized_image = photon_rs::transform::resize(
            image,
            format_width,
            format_height.try_into().unwrap(),
            SamplingFilter::Nearest,
        )
        .get_bytes_jpeg(100);

        sqlx::query!("INSERT INTO image_formats (id, format, file_id, width, height) VALUES ($1, $2, $3, $4, $5)",
            self.sf.next_id().map_err(|_| AppError::InternalError)? as i64,
            format,
            file_id,
            format_width as i32,
            format_height
        )
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error while creating image format: {}", e);
                AppError::InternalError
            })?;

        let image_format_path =
            Path::new(formats_folder_path).join(Self::make_image_format_name(file_id, format));

        let image_format_path = image_format_path.to_str().unwrap();

        tokio::fs::write(image_format_path, resized_image)
            .await
            .map_err(|e| {
                tracing::error!("Error while saving image: {}", e);
                AppError::InternalError
            })?;

        Ok(())
    }
}
