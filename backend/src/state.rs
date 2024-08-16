use axum::extract::State;
use sonyflake::Sonyflake;
use webauthn_rs::Webauthn;
use crate::db::KosmosPool;
use crate::services::album_service::AlbumService;
use crate::services::file_service::FileService;
use crate::services::folder_service::FolderService;
use crate::services::image_service::ImageService;
use crate::services::operation_service::OperationService;
use crate::services::passkey_service::PasskeyService;
use crate::services::permission_service::PermissionService;
use crate::services::search_service::SearchService;
use crate::services::share_service::ShareService;
use crate::services::usage_service::UsageService;
use crate::services::user_service::UserService;

pub type KosmosState = State<AppState>;

#[derive(Clone)]
pub struct AppState {
    pub user_service: UserService,
    pub file_service: FileService,
    pub folder_service: FolderService,
    pub image_service: ImageService,
    pub operation_service: OperationService,
    pub share_service: ShareService,
    pub permission_service: PermissionService,
    pub usage_service: UsageService,
    pub search_service: SearchService,
    pub album_service: AlbumService,
    pub passkey_service: PasskeyService,
    pub sf: Sonyflake,
}

pub fn init(db: &KosmosPool, webauthn: &Webauthn) -> AppState {
    let sf = Sonyflake::new().expect("Failed to initialize Sonyflake");
    let user_service = UserService::new(db.clone(), sf.clone());
    let file_service = FileService::new(db.clone(), sf.clone());
    let folder_service = FolderService::new(db.clone(), sf.clone());
    let image_service = ImageService::new(db.clone(), sf.clone());
    let operation_service = OperationService::new(db.clone(), sf.clone());
    let share_service = ShareService::new(db.clone(), sf.clone());
    let permission_service = PermissionService::new(user_service.clone());
    let usage_service = UsageService::new(db.clone());
    let search_service = SearchService::new(db.clone());
    let album_service = AlbumService::new(db.clone(), sf.clone());
    let passkey_service = PasskeyService::new(db.clone(), webauthn.clone());

    AppState {
        user_service,
        file_service,
        folder_service,
        image_service,
        operation_service,
        share_service,
        permission_service,
        usage_service,
        search_service,
        album_service,
        passkey_service,
        sf,
    }
}
