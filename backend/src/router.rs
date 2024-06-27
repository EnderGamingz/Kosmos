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
            post(crate::routes::api::v1::auth::folder::create_folder)
                .delete(crate::routes::api::v1::auth::folder::delete::delete_folder)
                .patch(crate::routes::api::v1::auth::folder::rename_folder),
        )
        .route(
            "/all",
            get(crate::routes::api::v1::auth::folder::get_folders),
        )
        .route(
            "/all/:folder_id",
            get(crate::routes::api::v1::auth::folder::get_folders),
        )
        .route(
            "/move/:folder_id",
            put(crate::routes::api::v1::auth::folder::move_folder),
        )
}

fn get_image_router() -> KosmosRouter {
    Router::new()
        .route(
            "/:file_id/:format",
            get(crate::routes::api::v1::auth::file::image::get_image_by_format),
        )
        .route(
            "/retry/operation/:operation_id",
            post(crate::routes::api::v1::auth::file::image::reprocess_images_from_operation),
        )
}

fn get_file_router() -> KosmosRouter {
    Router::new()
        .route(
            "/:file_id",
            delete(crate::routes::api::v1::auth::file::bin::permanently_delete_file)
                .patch(crate::routes::api::v1::auth::file::rename_file),
        )
        .route(
            "/:file_id/action/:operation_type",
            get(crate::routes::api::v1::auth::download::handle_raw_file),
        )
        .route(
            "/:file_id/bin",
            post(crate::routes::api::v1::auth::file::bin::mark_file_for_deletion),
        )
        .route(
            "/:file_id/restore",
            post(crate::routes::api::v1::auth::file::bin::restore_file),
        )
        .route(
            "/upload",
            post(crate::routes::api::v1::auth::file::upload::upload_file),
        )
        .route(
            "/upload/:folder_id",
            post(crate::routes::api::v1::auth::file::upload::upload_file),
        )
        .route(
            "/bin/clear",
            post(crate::routes::api::v1::auth::file::bin::clear_bin),
        )
        .route("/all", get(crate::routes::api::v1::auth::file::get_files))
        .route(
            "/all/recent",
            get(crate::routes::api::v1::auth::file::get_recent_files),
        )
        .route(
            "/all/deleted",
            get(crate::routes::api::v1::auth::file::get_deleted_files),
        )
        .route(
            "/all/:folder_id",
            get(crate::routes::api::v1::auth::file::get_files),
        )
        .route(
            "/move/:file_id",
            put(crate::routes::api::v1::auth::file::move_file),
        )
        .layer(DefaultBodyLimit::disable())
        .nest("/image", get_image_router())
}

fn get_download_router() -> KosmosRouter {
    Router::new().route(
        "/file/:file_id",
        get(crate::routes::api::v1::auth::download::handle_raw_file),
    )
}

fn get_user_router() -> KosmosRouter {
    Router::new()
        .route("/", delete(crate::routes::api::v1::auth::user::delete::delete_self))
        .route(
        "/usage",
        get(crate::routes::api::v1::auth::user::get_disk_usage),
    )
}

fn get_multi_router() -> KosmosRouter {
    Router::new().route(
        "/",
        post(crate::routes::api::v1::auth::download::multi_download)
            .delete(crate::routes::api::v1::auth::folder::delete::multi_delete),
    )
}

fn get_operation_router() -> Router<AppState> {
    Router::new().route(
        "/all",
        get(crate::routes::api::v1::auth::operation::get_all_operations),
    )
}

fn get_auth_router() -> KosmosRouter {
    Router::new()
        .route("/", get(crate::routes::api::v1::auth::auth))
        .route("/login", post(crate::routes::api::v1::auth::login))
        .route("/register", post(crate::routes::api::v1::auth::register))
        .route("/logout", post(crate::routes::api::v1::auth::logout))
        .nest("/file", get_file_router())
        .nest("/folder", get_folder_router())
        .nest("/download", get_download_router())
        .nest("/multi", get_multi_router())
        .nest("/operation", get_operation_router())
        .nest("/user", get_user_router())
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
