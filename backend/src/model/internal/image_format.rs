use serde::Serialize;
use sqlx::Type;
use crate::response::error_handling::AppError;

#[repr(i16)]
#[derive(Clone, Copy, PartialEq, Debug, Serialize, Type)]
pub enum ImageFormat {
    Thumbnail = 0,
}

impl From<i16> for ImageFormat {
    fn from(num: i16) -> Self {
        Self::format_by_id_unsafe(num)
    }
}

impl ImageFormat {
    pub fn format_by_id_unsafe(num: i16) -> Self {
        match num {
            _ => ImageFormat::Thumbnail,
        }
    }
    pub fn format_by_id_save(num: i16) -> Result<Self, AppError> {
        Ok(Self::format_by_id_unsafe(num))
    }

    pub fn id_by_format(num: ImageFormat) -> i16 {
        match num {
            ImageFormat::Thumbnail => 0,
        }
    }

    pub fn width_by_format(&self) -> u32 {
        match self {
            ImageFormat::Thumbnail => 256,
        }
    }

    pub const IMAGE_FORMATS: [ImageFormat; 1] = [
        ImageFormat::Thumbnail,
    ];
}