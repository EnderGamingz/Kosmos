use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use crate::model::internal::image_format::ImageFormat;

#[derive(Clone, FromRow, Debug, Serialize)]
pub struct ImageFormatModel {
    pub id: i64,
    pub format: ImageFormat,
    pub file_id: i64,
    pub width: i32,
    pub height: i32,
    pub created_at: DateTime<Utc>,
}
