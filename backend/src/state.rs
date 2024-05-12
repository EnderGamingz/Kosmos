use axum::extract::State;
use sonyflake::Sonyflake;

use crate::db::KosmosPool;
use crate::services::file_service::FileService;
use crate::services::folder_service::FolderService;
use crate::services::user_service::UserService;

pub type KosmosState = State<AppState>;

#[derive(Clone)]
pub struct AppState {
    pub(crate) user_service: UserService,
    pub(crate) file_service: FileService,
    pub(crate) folder_service: FolderService,
    pub sf: Sonyflake,
}

pub(crate) fn init(db: &KosmosPool) -> AppState {
    let sf = Sonyflake::new().expect("Failed to initialize Sonyflake");
    let user_service = UserService::new(db.clone(), sf.clone());
    let file_service = FileService::new(db.clone(), sf.clone());
    let folder_service = FolderService::new(db.clone(), sf.clone());
    AppState {
        user_service,
        file_service,
        folder_service,
        sf,
    }
}
