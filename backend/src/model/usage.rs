use bigdecimal::ToPrimitive;
use serde::Serialize;
use sqlx::types::BigDecimal;
use sqlx::FromRow;
use ts_rs::TS;

#[derive(FromRow)]
pub struct UsageSumData {
    pub sum: Option<BigDecimal>,
    pub count: Option<i64>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct UsageSumDataDTO {
    #[ts(type = "number")]
    pub sum: i64,
    #[ts(type = "number")]
    pub count: i64,
}

impl UsageSumData {
    pub fn get_sum(&self) -> i64 {
        self.sum
            .as_ref()
            .map(|x| x.to_i64().unwrap_or(0))
            .unwrap_or(0)
    }
}

impl From<UsageSumData> for UsageSumDataDTO {
    fn from(data: UsageSumData) -> Self {
        UsageSumDataDTO {
            sum: data.get_sum(),
            count: data.count.unwrap_or(0),
        }
    }
}

#[derive(FromRow)]
pub struct FileTypeSumData {
    pub file_type: i16,
    pub sum: Option<BigDecimal>,
    pub count: Option<i64>,
}

#[derive(Serialize, TS)]
#[ts(export)]
pub struct FileTypeSumDataDTO {
    pub file_type: i16,
    #[ts(type = "number")]
    pub sum: i64,
    #[ts(type = "number")]
    pub count: i64,
}

impl FileTypeSumData {
    pub fn get_sum(&self) -> i64 {
        self.sum
            .as_ref()
            .map(|x| x.to_i64().unwrap_or(0))
            .unwrap_or(0)
    }
}

impl From<FileTypeSumData> for FileTypeSumDataDTO {
    fn from(data: FileTypeSumData) -> Self {
        FileTypeSumDataDTO {
            file_type: data.file_type,
            sum: data.get_sum(),
            count: data.count.unwrap_or(0),
        }
    }
}
