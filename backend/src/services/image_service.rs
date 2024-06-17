use crate::db::KosmosPool;
use crate::model::file::PreviewStatus;
use crate::model::image::{ImageFormat, IMAGE_FORMATS};
use crate::model::operation::{OperationStatus, OperationType};
use crate::response::error_handling::AppError;
use crate::state::AppState;
use futures::future;
use itertools::Itertools;
use photon_rs::native::open_image_from_bytes;
use photon_rs::transform::SamplingFilter;
use photon_rs::PhotonImage;
use sonyflake::Sonyflake;
use sqlx::types::JsonValue;
use std::path::Path;
use std::sync::Arc;

#[derive(Clone)]
pub struct ImageFormatInsert {
    format: i16,
    file_id: i64,
    width: i32,
    height: i32,
}

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

    pub async fn generate_all_formats(
        &self,
        file_ids: Vec<i64>,
        user_id: i64,
        state: Arc<AppState>,
        started_by_operation: Option<i64>,
    ) -> Result<(), AppError> {
        let total_files = file_ids.len();
        let mut pending_inserts: Vec<ImageFormatInsert> = Vec::with_capacity(total_files);

        let upload_location = std::env::var("UPLOAD_LOCATION").unwrap();

        let operation = state
            .operation_service
            .create_operation(
                user_id,
                OperationType::ImageProcessing,
                OperationStatus::Pending,
                Some(JsonValue::from(file_ids.clone())),
            )
            .await?;

        let mut pending_insert_handles = file_ids
            .into_iter()
            .map(|id| Self::generate_image_sizes(id, &upload_location))
            .map(Box::pin)
            .collect::<Vec<_>>();

        println!("Created {} handles", pending_insert_handles.len());

        let mut failures = vec![];
        let mut successes = vec![];

        while !pending_insert_handles.is_empty() {
            match future::select_all(pending_insert_handles).await {
                (Ok(val), _, remaining) => {
                    println!("Done, {} left", remaining.len());
                    pending_inserts.extend(val.clone());
                    pending_insert_handles = remaining;

                    match val.get(0) {
                        Some(row) => {
                            successes.push(row.file_id);
                        }
                        None => {}
                    }
                }
                (Err(id), _, remaining) => {
                    pending_insert_handles = remaining;
                    failures.push(id);
                }
            }
        }

        let (ids, formats, file_ids, widths, heights): (
            Vec<i64>,
            Vec<i16>,
            Vec<i64>,
            Vec<i32>,
            Vec<i32>,
        ) = pending_inserts
            .into_iter()
            .map(|row| {
                (
                    self.sf.next_id().unwrap() as i64,
                    row.format,
                    row.file_id,
                    row.width,
                    row.height,
                )
            })
            .multiunzip();

        sqlx::query!("INSERT INTO image_formats (id, format, file_id, width, height) SELECT * FROM UNNEST($1::BIGINT[], $2::SMALLINT[], $3::BIGINT[], $4::INT[], $5::INT[])",
            &ids[..],
            &formats[..],
            &file_ids[..],
            &widths[..],
            &heights[..]
        )
            .execute(&self.db_pool)
            .await
            .map_err(|e| {
                tracing::error!("Error while creating image format: {}", e);
                AppError::InternalError
            })?;

        println!("Failure: {}, total: {}", failures.len(), file_ids.len());

        if failures.len() == total_files {
            state
                .operation_service
                .update_operation(
                    operation.id,
                    OperationStatus::Unrecoverable,
                    Some("Failed to generate all formats".to_string()),
                )
                .await?;
        } else {
            state
                .operation_service
                .update_operation(operation.id, OperationStatus::Success, None)
                .await?;
        }

        if started_by_operation.is_some() {
            let status = if failures.len() == total_files {
                OperationStatus::Unrecoverable
            } else {
                OperationStatus::Recovered
            };

            let result = if failures.len() == total_files {
                Some("Failed to generate all formats".to_string())
            } else {
                Some("Format generation recovered".to_string())
            };

            state
                .operation_service
                .update_operation(started_by_operation.unwrap(), status, result)
                .await?;
        }

        println!("Done generating");

        state
            .file_service
            .update_preview_status_for_file_ids(&failures, PreviewStatus::Failed)
            .await?;

        state
            .file_service
            .update_preview_status_for_file_ids(&successes, PreviewStatus::Ready)
            .await?;

        Ok(())
    }

    pub async fn generate_image_sizes(
        file_id: i64,
        upload_location: &String,
    ) -> Result<Vec<ImageFormatInsert>, i64> {
        println!("Starting with {}", file_id);
        let original_image_path = Path::new(&upload_location).join(file_id.to_string());
        let original_image_path_str = original_image_path.to_str().unwrap();

        let image_formats_path = Path::new(&upload_location).join("formats");
        let image_formats_path_str = image_formats_path.to_str().unwrap();

        let image_bytes = tokio::fs::read(original_image_path_str)
            .await
            .map_err(|e| {
                tracing::error!("Error while reading image file {}: {}", file_id, e);
                file_id
            })?;

        let image = open_image_from_bytes(&*image_bytes).map_err(|e| {
            tracing::error!("Error while opening image file {}: {}", file_id, e);
            file_id
        })?;
        println!("Loaded image {}", file_id);

        let mut format_inserts: Vec<ImageFormatInsert> = vec![];

        for format in IMAGE_FORMATS {
            let res =
                Self::generate_image_size(file_id, format, &image_formats_path_str, &image).await?;
            format_inserts.push(res)
        }

        println!("Done with {}", file_id);

        Ok(format_inserts)
    }

    async fn generate_image_size(
        file_id: i64,
        format: ImageFormat,
        formats_folder_path: &str,
        image: &PhotonImage,
    ) -> Result<ImageFormatInsert, i64> {
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

        let image_format_path =
            Path::new(formats_folder_path).join(Self::make_image_format_name(file_id, format));

        let image_format_path = image_format_path.to_str().unwrap();

        tokio::fs::write(image_format_path, resized_image)
            .await
            .map_err(|e| {
                tracing::error!("Error while saving image: {}", e);
                file_id
            })?;

        Ok(ImageFormatInsert {
            width: format_width as i32,
            height: format_height,
            file_id,
            format,
        })
    }
}
