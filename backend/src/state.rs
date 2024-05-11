use crate::db::KosmosPool;
use crate::services::user_service::UserService;
use axum::extract::State;
use sonyflake::Sonyflake;

pub type KosmosState = State<AppState>;

#[derive(Clone)]
pub struct AppState {
    pub(crate) user_service: UserService,
}

pub(crate) fn init(db: &KosmosPool) -> AppState {
    let sf = Sonyflake::new().expect("Failed to initialize Sonyflake");
    let user_service = UserService::new(db.clone(), sf.clone());

    AppState { user_service }
}
