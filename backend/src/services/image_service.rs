use crate::db::KosmosPool;
use crate::model::image::{ImageFormat, IMAGE_FORMATS};
use crate::response::error_handling::AppError;
use futures::future;
use itertools::Itertools;
use photon_rs::native::open_image_from_bytes;
use photon_rs::transform::SamplingFilter;
use photon_rs::PhotonImage;
use sonyflake::Sonyflake;
use std::path::Path;

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

    pub async fn generate_all_formats(&self, file_ids: Vec<i64>) -> Result<(), AppError> {
        let mut pending_inserts: Vec<ImageFormatInsert> = Vec::with_capacity(file_ids.len());

        let mut pending_insert_handles = file_ids
            .into_iter()
            .map(|id| Self::generate_image_sizes(id))
            .map(Box::pin)
            .collect::<Vec<_>>();

        println!("Created {} handles", pending_insert_handles.len());

        while !pending_insert_handles.is_empty() {
            match future::select_all(pending_insert_handles).await {
                (Ok(val), _, remaining) => {
                    println!("Done, {} left", remaining.len());
                    pending_inserts.extend(val);
                    pending_insert_handles = remaining;
                }
                (Err(_e), index, remaining) => {
                    println!("Error with {index}");
                    pending_insert_handles = remaining;
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

        println!("Done generating");

        Ok(())
    }

    pub async fn generate_image_sizes(file_id: i64) -> Result<Vec<ImageFormatInsert>, AppError> {
        let upload_location = std::env::var("UPLOAD_LOCATION").unwrap();

        let original_image_path = Path::new(&upload_location).join(file_id.to_string());
        let original_image_path_str = original_image_path.to_str().unwrap();

        let image_formats_path = Path::new(&upload_location).join("formats");
        let image_formats_path_str = image_formats_path.to_str().unwrap();

        let image_bytes = tokio::fs::read(original_image_path_str)
            .await
            .map_err(|e| {
                tracing::error!("Error while reading image file {}: {}", file_id, e);
                AppError::NotFound {
                    error: "Error while trying to read image file".to_string(),
                }
            })?;

        let image = open_image_from_bytes(&*image_bytes).unwrap();

        let mut format_inserts: Vec<ImageFormatInsert> = vec![];

        for format in IMAGE_FORMATS {
            let res =
                Self::generate_image_size(file_id, format, &image_formats_path_str, &image).await?;
            format_inserts.push(res)
        }

        Ok(format_inserts)
    }

    async fn generate_image_size(
        file_id: i64,
        format: ImageFormat,
        formats_folder_path: &str,
        image: &PhotonImage,
    ) -> Result<ImageFormatInsert, AppError> {
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
                AppError::InternalError
            })?;

        Ok(ImageFormatInsert {
            width: format_width as i32,
            height: format_height,
            file_id,
            format,
        })
    }
}
