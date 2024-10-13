use serde::{Deserialize, Serialize};
use sqlx::Type;

#[repr(i16)]
#[derive(Clone, Copy, PartialEq, Debug, Serialize, Type, Deserialize)]
pub enum FileType {
    Generic = 0,
    Image = 1,
    Video = 2,
    Audio = 3,
    Document = 4,
    RawImage = 5,
    LargeImage = 6,
    Archive = 7,
    Editable = 8,
}

impl From<i16> for FileType {
    fn from(num: i16) -> Self {
        Self::new(num)
    }
}

impl FileType {
    pub fn new(num: i16) -> Self {
        match num {
            1 => FileType::Image,
            2 => FileType::Video,
            3 => FileType::Audio,
            4 => FileType::Document,
            5 => FileType::RawImage,
            6 => FileType::LargeImage,
            7 => FileType::Archive,
            8 => FileType::Editable,
            _ => FileType::Generic,
        }
    }

    pub fn check_valid_for_empty_file(&self) -> bool {
        FileType::FILE_TYPES_FOR_EMPTY_FILE.contains(self)
    }

    pub const VALID_FILE_TYPES_FOR_ALBUM: [FileType; 3] =
        [FileType::Image, FileType::RawImage, FileType::LargeImage];

    pub const FILE_TYPES_FOR_UPDATE: [FileType; 1] = [FileType::Editable];

    pub const FILE_TYPES_FOR_EMPTY_FILE: [FileType; 1] = [FileType::Editable];
}
