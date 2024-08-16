use std::io::Cursor;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use exif::{In, Tag};
use futures::future;
use image::{DynamicImage, EncodableLayout, ExtendedColorType, ImageError, ImageReader, RgbImage};
use image::codecs::jpeg::JpegEncoder;
use itertools::Itertools;
use sonyflake::Sonyflake;
use sqlx::types::JsonValue;

use crate::db::KosmosPool;
use crate::model::internal::preview_status::PreviewStatus;
use crate::model::internal::image_format::ImageFormat;
use crate::model::internal::operation_type::OperationType;
use crate::model::internal::operation_status::OperationStatus;
use crate::response::error_handling::AppError;
use crate::state::AppState;

#[derive(Debug)]
pub struct ImageServiceResizeError {
    file_id: i64,
    format: ImageFormat,
    kind: ImageServiceErrorKind,
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
    ResizeImageFileSaveError { io_error: tokio::io::Error },
    ResizeImageSaveError { image_error: ImageError },
    ImageLoadError { io_error: std::io::Error },
    ImageGuessFormatError { io_error: std::io::Error },
    ImageDecodeError { image_error: ImageError },
    ExifReadError { exif_error: exif::Error },
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

        if !failures.is_empty() {
            tracing::error!("Failed to generate formats {:?}", failures);
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

        let failed_filed_ids = failures
            .iter()
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

        let image_buff = tokio::fs::read(original_image_path.clone())
            .await
            .map_err(|e| ImageServiceResizeError {
                file_id,
                format: ImageFormat::Thumbnail,
                kind: ImageServiceErrorKind::ImageLoadError { io_error: e },
            })?;

        let mut cursor = Cursor::new(&image_buff);

        let image = ImageReader::new(&mut cursor)
            .with_guessed_format()
            .map_err(|e| ImageServiceResizeError {
                file_id,
                format: ImageFormat::Thumbnail,
                kind: ImageServiceErrorKind::ImageGuessFormatError { io_error: e },
            })?
            .decode()
            .map_err(|e| ImageServiceResizeError {
                file_id,
                format: ImageFormat::Thumbnail,
                kind: ImageServiceErrorKind::ImageDecodeError { image_error: e },
            })?;

        let mut format_inserts: Vec<ImageFormatInsert> = vec![];

        for format in ImageFormat::IMAGE_FORMATS {
            let resize_image = Self::resize_image_and_convert_to_jpg(format, &image, &image_buff)
                .map_err(|e| e.into_error(file_id, format))?;

            let response =
                Self::save_resized_image(file_id, format, resize_image, &image_formats_path)
                    .await
                    .map_err(|e| e.into_error(file_id, format))?;

            format_inserts.push(response)
        }

        println!("Done with {}", file_id);

        Ok(format_inserts)
    }

    async fn save_resized_image(
        file_id: i64,
        format: ImageFormat,
        resized_image: RgbImage,
        formats_folder_path: &PathBuf,
    ) -> Result<ImageFormatInsert, ImageServiceErrorKind> {
        let image_format_path =
            Path::new(formats_folder_path).join(Self::make_image_format_name(file_id, format));

        let image_format_path = image_format_path.to_str().unwrap();

        let format_height = resized_image.height();
        let format_width = resized_image.width();

        let mut buff = vec![];

        JpegEncoder::new(&mut buff)
            .encode(
                resized_image.as_bytes(),
                format_width,
                format_height,
                ExtendedColorType::Rgb8,
            )
            .map_err(|image_error| ImageServiceErrorKind::ResizeImageSaveError { image_error })?;

        tokio::fs::write(image_format_path, buff)
            .await
            .map_err(|e| ImageServiceErrorKind::ResizeImageFileSaveError { io_error: e })?;

        Ok(ImageFormatInsert {
            width: format_width as i32,
            height: format_height as i32,
            file_id,
            format: format as i16,
        })
    }

    fn resize_image_and_convert_to_jpg(
        format: ImageFormat,
        image: &DynamicImage,
        image_buff: &[u8],
    ) -> Result<RgbImage, ImageServiceErrorKind> {
        let max_size = format.width_by_format();

        let mut cursor = Cursor::new(image_buff);

        let exif_reader = exif::Reader::new();
        let exif_result = exif_reader.read_from_container(&mut cursor);
        let exif_orientation = if let Ok(exif) = exif_result {
            exif.get_field(Tag::Orientation, In::PRIMARY).map(|f| f.value.clone())
        } else {
            None
        };

        // Rotate image if exif orientation is not 1
        let image = if let Some(orientation) = exif_orientation {
            match orientation.get_uint(0) {
                Some(v @ 1..=8) => match v {
                    1 => image.clone(),
                    2 => image.fliph(),
                    3 => image.rotate180(),
                    4 => image.fliph().rotate180(),
                    5 => image.rotate90().fliph(),
                    6 => image.rotate90(),
                    7 => image.rotate270().fliph(),
                    8 => image.rotate270(),
                    _ => image.clone(),
                },
                _ => image.clone(),
            }
        } else {
            image.clone()
        };

        Ok(image.thumbnail(max_size, max_size).to_rgb8())
    }
}
