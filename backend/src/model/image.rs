use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use crate::response::error_handling::AppError;

#[repr(i16)]
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum ImageFormat {
    Thumbnail = 0,
}

pub const IMAGE_FORMATS: [ImageFormat; 1] = [
    ImageFormat::Thumbnail,
];

impl ImageFormat {
    pub fn format_by_id_unsafe(num: i16) -> ImageFormat {
        match num {
            _ => ImageFormat::Thumbnail,
        }
    }
    pub fn format_by_id_save(num: i16) -> Result<ImageFormat, AppError> {
        Ok(Self::format_by_id_unsafe(num))
    }


    pub fn id_by_format(num: ImageFormat) -> i16 {
        match num {
            ImageFormat::Thumbnail => 0,
        }
    }

    pub fn width_by_format(&self, num: ImageFormat) -> u32 {
        match self {
            ImageFormat::Thumbnail => 256,
        }
    }
}

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct ImageFormatModel {
    pub id: i64,
    pub format: i16,
    pub file_id: i64,
    pub width: i32,
    pub height: i32,
    pub created_at: DateTime<Utc>,
}
