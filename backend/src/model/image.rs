use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;

#[repr(i16)]
#[derive(Clone, Copy, PartialEq)]
pub enum ImageFormat {
    Thumbnail = 0,
}

pub const IMAGE_FORMATS: [ImageFormat; 1] = [
    ImageFormat::Thumbnail,
];

impl ImageFormat {
    pub fn get_format_by_id(num: i16) -> ImageFormat {
        match num {
            _ => ImageFormat::Thumbnail,
        }
    }

    pub fn get_id_by_format(num: ImageFormat) -> i16 {
        match num {
            ImageFormat::Thumbnail => 0,
        }
    }

    pub fn get_width_by_format(num: ImageFormat) -> u32 {
        match num {
            ImageFormat::Thumbnail => 128,
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
