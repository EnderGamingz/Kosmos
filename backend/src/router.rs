use axum::extract::DefaultBodyLimit;
use axum::Router;
use axum::routing::{delete, get, patch, post, put};
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
            "/favorite/:folder_id",
            put(crate::routes::api::v1::auth::folder::favorite::favorite_folder),
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
            "/favorite/:file_id",
            put(crate::routes::api::v1::auth::file::favorite::favorite_file),
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
        .route(
            "/",
            patch(crate::routes::api::v1::auth::user::update::update_user)
                .delete(crate::routes::api::v1::auth::user::delete::delete_self),
        )
        .route(
            "/password",
            patch(crate::routes::api::v1::auth::user::update::update_user_password),
        )
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

fn get_operation_router() -> KosmosRouter {
    Router::new().route(
        "/all",
        get(crate::routes::api::v1::auth::operation::get_all_operations),
    )
}

fn get_share_router() -> KosmosRouter {
    Router::new()
        .route(
            "/file/:file_id",
            get(crate::routes::api::v1::share::get_file_shares_for_user),
        )
        .route(
            "/file/public",
            post(crate::routes::api::v1::share::create::share_file_public),
        )
        .route(
            "/file/private",
            post(crate::routes::api::v1::share::create::share_file_private),
        )
        .route(
            "/folder/:folder_id",
            get(crate::routes::api::v1::share::get_folder_shares_for_user),
        )
        .route(
            "/folder/public",
            post(crate::routes::api::v1::share::create::share_folder_public),
        )
        .route(
            "/folder/private",
            post(crate::routes::api::v1::share::create::share_folder_private),
        )
        .route(
            "/:share_id",
            delete(crate::routes::api::v1::share::delete_share),
        )
}

fn get_auth_router() -> KosmosRouter {
    Router::new()
        .route("/", get(crate::routes::api::v1::auth::auth))
        .route("/login", post(crate::routes::api::v1::auth::login))
        .route("/register", post(crate::routes::api::v1::auth::register))
        .route("/logout", post(crate::routes::api::v1::auth::logout))
        .nest("/share", get_share_router())
        .nest("/file", get_file_router())
        .nest("/folder", get_folder_router())
        .nest("/download", get_download_router())
        .nest("/multi", get_multi_router())
        .nest("/operation", get_operation_router())
        .nest("/user", get_user_router())
}

fn get_public_share_router() -> KosmosRouter {
    Router::new()
        .route(
            "/file/:share_id",
            get(crate::routes::api::v1::share::access_file_share),
        )
        .route(
            "/file/:share_id/action/:operation_type",
            get(crate::routes::api::v1::auth::download::handle_raw_file_share),
        )
        .route(
            "/folder/:share_id",
            get(crate::routes::api::v1::share::access_folder_share),
        )
        .route(
            "/folder/:share_id/:access_type/:access_id",
            get(crate::routes::api::v1::share::access_folder_share_item),
        )
        .route(
            "/folder/:share_id/File/:file_id/action/:operation_type",
            get(crate::routes::api::v1::auth::download::handle_raw_file_share_through_folder),
        )
        .route(
            "/folder/:share_id/image/:file_id/:format",
            get(crate::routes::api::v1::auth::file::image::get_share_image_by_format),
        )
        .route("/unlock", post(crate::routes::api::v1::share::unlock_share))
}

pub fn init(cors: CorsLayer, session_layer: KosmosSession, state: AppState) -> Router {
    let api_router = Router::new()
        .nest("/auth", get_auth_router())
        .nest("/s", get_public_share_router());

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
