use axum::extract::State;
use sonyflake::Sonyflake;

use crate::db::KosmosPool;
use crate::services::file_service::FileService;
use crate::services::folder_service::FolderService;
use crate::services::image_service::ImageService;
use crate::services::operation_service::OperationService;
use crate::services::permission_service::PermissionService;
use crate::services::share_service::ShareService;
use crate::services::user_service::UserService;

pub type KosmosState = State<AppState>;

#[derive(Clone)]
pub struct AppState {
    pub(crate) user_service: UserService,
    pub(crate) file_service: FileService,
    pub(crate) folder_service: FolderService,
    pub(crate) image_service: ImageService,
    pub(crate) operation_service: OperationService,
    pub(crate) share_service: ShareService,
    pub(crate) permission_service: PermissionService,
    pub sf: Sonyflake,
}

pub(crate) fn init(db: &KosmosPool) -> AppState {
    let sf = Sonyflake::new().expect("Failed to initialize Sonyflake");
    let user_service = UserService::new(db.clone(), sf.clone());
    let file_service = FileService::new(db.clone());
    let folder_service = FolderService::new(db.clone(), sf.clone());
    let image_service = ImageService::new(db.clone(), sf.clone());
    let operation_service = OperationService::new(db.clone(), sf.clone());
    let share_service = ShareService::new(db.clone(), sf.clone());
    let permission_service = PermissionService::new(db.clone(), user_service.clone());

    AppState {
        user_service,
        file_service,
        folder_service,
        image_service,
        operation_service,
        share_service,
        permission_service,
        sf,
    }
}
