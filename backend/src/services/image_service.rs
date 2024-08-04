use std::io::Cursor;
use crate::db::KosmosPool;
use crate::model::file::PreviewStatus;
use crate::model::image::{ImageFormat, IMAGE_FORMATS};
use crate::model::operation::{OperationStatus, OperationType};
use crate::response::error_handling::AppError;
use crate::state::AppState;
use futures::{future};
use itertools::Itertools;
use sonyflake::Sonyflake;
use sqlx::types::JsonValue;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use image::{DynamicImage, ImageError};
use image::imageops::FilterType;


#[derive(Debug)]
pub struct ImageServiceResizeError {
    file_id: i64,
    format: ImageFormat,
    kind: ImageServiceErrorKind
}

impl ImageServiceErrorKind {

    pub fn into_error(self, file_id: i64, format: ImageFormat) -> ImageServiceResizeError {
        ImageServiceResizeError {
            file_id,
            format,
            kind: self,
        }
    }

}

#[derive(Debug)]
pub enum ImageServiceErrorKind {
    ResizeImageFileSaveError {
        io_error: tokio::io::Error,
    },
    ResizeImageSaveError {
        image_error: ImageError,
    }
}


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

    pub fn make_image_format_name(id: i64, format: ImageFormat) -> String {
        format!("{}_{}", id, format as i16).as_str().to_string()
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

        let failed_filed_ids = failures.iter()
            .map(|error| error.file_id)
            .collect::<Vec<_>>();


        state
            .file_service
            .update_preview_status_for_file_ids(&failed_filed_ids, PreviewStatus::Failed)
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
    ) -> Result<Vec<ImageFormatInsert>, ImageServiceResizeError> {
        println!("Starting with {}", file_id);
        let original_image_path = Path::new(&upload_location).join(file_id.to_string());
        let image_formats_path = Path::new(&upload_location).join("formats");

        let image = image::open(original_image_path)
            .expect("test");

        println!("Loaded image {}", file_id);

        let mut format_inserts: Vec<ImageFormatInsert> = vec![];

        for format in IMAGE_FORMATS {
            let resize_image = Self::resize_image_and_convert_to_jpg(format, &image);

            let response = Self::save_resized_image(file_id, format, resize_image, &image_formats_path)
                .await
                .map_err(|e| e.into_error(file_id, format))?;

            format_inserts.push(response)
        }

        println!("Done with {}", file_id);

        Ok(format_inserts)
    }

    async fn save_resized_image(file_id: i64, format: ImageFormat, resized_image: DynamicImage, formats_folder_path: &PathBuf) -> Result<ImageFormatInsert, ImageServiceErrorKind> {
        let image_format_path =
            Path::new(formats_folder_path).join(Self::make_image_format_name(file_id, format));

        let image_format_path = image_format_path.to_str().unwrap();


        let format_height = resized_image.height();
        let format_width = resized_image.width();

        let mut writer = Vec::with_capacity(resized_image.as_bytes().len());
        let mut cursor = Cursor::new(&mut writer);
        resized_image.write_to(&mut cursor, image::ImageFormat::Jpeg)
            .map_err(|image_error| ImageServiceErrorKind::ResizeImageSaveError { image_error })?;

        tokio::fs::write(image_format_path, writer)
            .await
            .map_err(|e| {
                ImageServiceErrorKind::ResizeImageFileSaveError {
                    io_error: e,
                }
            })?;


        Ok(ImageFormatInsert {
            width: format_width as i32,
            height: format_height as i32,
            file_id,
            format: format as i16,
        })
    }

    fn resize_image_and_convert_to_jpg(format: ImageFormat, image: &DynamicImage) -> DynamicImage {
        let format_width = format.width_by_format(format);
        let aspect_ratio = image.width() as f32 / image.height() as f32;
        let format_height = (format_width as f32 / aspect_ratio) as u32;

        image.resize(format_width, format_height, FilterType::Nearest)
    }
}
