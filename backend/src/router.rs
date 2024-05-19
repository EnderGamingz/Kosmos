use axum::extract::DefaultBodyLimit;
use axum::routing::{delete, get, post, put};
use axum::Router;
use tower_http::cors::CorsLayer;
use tower_http::trace;
use tower_http::trace::TraceLayer;
use tracing::Level;

use crate::session::KosmosSession;
use crate::state::AppState;

pub type KosmosRouter = Router<AppState>;

fn get_folder_router() -> KosmosRouter {
    Router::new()
        .route(
            "/",
            post(crate::routes::api::v1::auth::folder::create_folder),
        )
        .route(
            "/:folder_id",
            post(crate::routes::api::v1::auth::folder::create_folder),
        )
        .route(
            "/:folder_id",
            delete(crate::routes::api::v1::auth::folder::delete_folder),
        )
        .route(
            "/all",
            get(crate::routes::api::v1::auth::folder::get_folders),
        )
        .route(
            "/all/:folder_id",
            get(crate::routes::api::v1::auth::folder::get_folders),
        )
}

fn get_image_router() -> KosmosRouter {
    Router::new()
        .route("/:file_id/:format", get(crate::routes::api::v1::auth::file::image::get_image_by_format))
}

fn get_file_router() -> KosmosRouter {
    Router::new()
        .route(
            "/upload",
            post(crate::routes::api::v1::auth::file::upload_file),
        )
        .route(
            "/upload/:folder_id",
            post(crate::routes::api::v1::auth::file::upload_file),
        )
        .route(
            "/:file_id",
            get(crate::routes::api::v1::auth::file::download_raw_file)
                .delete(crate::routes::api::v1::auth::file::delete_file),
        )
        .route("/all", get(crate::routes::api::v1::auth::file::get_files))
        .route(
            "/all/:file_id",
            get(crate::routes::api::v1::auth::file::get_files),
        )
        .route(
            "/move/:file_id",
            put(crate::routes::api::v1::auth::file::move_file),
        )
        .layer(DefaultBodyLimit::disable())
        .nest("/image", get_image_router())
}

fn get_auth_router() -> KosmosRouter {
    Router::new()
        .route("/", get(crate::routes::api::v1::auth::auth))
        .route("/login", post(crate::routes::api::v1::auth::login))
        .route("/register", post(crate::routes::api::v1::auth::register))
        .route("/logout", post(crate::routes::api::v1::auth::logout))
        .nest("/file", get_file_router())
        .nest("/folder", get_folder_router())
}

pub fn init(cors: CorsLayer, session_layer: KosmosSession, state: AppState) -> Router {
    let api_router = Router::new().nest("/auth", get_auth_router());

    Router::new()
        .nest("/api/v1", api_router)
        .layer(session_layer)
        .layer(cors)
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
                .on_response(trace::DefaultOnResponse::new().level(Level::INFO)),
        )
        .with_state(state)
}
