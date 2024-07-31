use axum::extract::DefaultBodyLimit;
use axum::routing::{delete, get, patch, post, put};
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
            "/:file_id/albums",
            get(crate::routes::api::v1::auth::album::read::get_albums_for_file),
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
            "/all/type/:file_type",
            get(crate::routes::api::v1::auth::file::get_file_by_type),
        )
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

fn get_usage_router() -> KosmosRouter {
    Router::new()
        .route(
            "/stats",
            get(crate::routes::api::v1::auth::user::usage::get_usage_stats),
        )
        .route(
            "/report",
            get(crate::routes::api::v1::auth::user::usage::get_usage_report),
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
        .nest("/usage", get_usage_router())
}

fn get_multi_router() -> KosmosRouter {
    Router::new()
        .route(
            "/",
            post(crate::routes::api::v1::auth::download::multi_download)
                .delete(crate::routes::api::v1::auth::folder::delete::multi_delete)
                .put(crate::routes::api::v1::auth::folder::multi_move),
        )
        .route(
            "/bin",
            post(crate::routes::api::v1::auth::file::bin::mark_files_for_deletion),
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
            "/all",
            get(crate::routes::api::v1::share::shared_items::get_shared_items),
        )
        .route(
            "/all/me",
            get(crate::routes::api::v1::share::shared_items::get_targeted_shared_items_for_user),
        )
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
            patch(crate::routes::api::v1::share::update_share)
                .delete(crate::routes::api::v1::share::delete_share),
        )
}

fn get_admin_router() -> KosmosRouter {
    Router::new()
        .route(
            "/user",
            get(crate::routes::api::v1::auth::admin::user::get_all_users)
                .post(crate::routes::api::v1::auth::admin::user::create_user),
        )
        .route(
            "/user/:user_id",
            get(crate::routes::api::v1::auth::admin::user::get_user)
                .delete(crate::routes::api::v1::auth::admin::user::delete_user)
                .patch(crate::routes::api::v1::auth::admin::user::update_user),
        )
        .route(
            "/user/:user_id/usage",
            get(crate::routes::api::v1::auth::admin::user::get_user_usage),
        )
}

fn get_search_router() -> KosmosRouter {
    Router::new().route("/", get(crate::routes::api::v1::auth::search))
}

fn get_favorite_router() -> KosmosRouter {
    Router::new()
        .route(
            "/",
            get(crate::routes::api::v1::auth::favorite::read::get_favorites),
        )
        .route(
            "/folder/:folder_id",
            put(crate::routes::api::v1::auth::folder::favorite::favorite_folder),
        )
        .route(
            "/file/:file_id",
            put(crate::routes::api::v1::auth::file::favorite::favorite_file),
        )
}

fn get_album_router() -> KosmosRouter {
    Router::new()
        .route(
            "/",
            get(crate::routes::api::v1::auth::album::read::get_albums)
                .patch(crate::routes::api::v1::auth::album::update::update_album)
                .post(crate::routes::api::v1::auth::album::create::create_album),
        )
        .route(
            "/:album_id",
            get(crate::routes::api::v1::auth::album::read::get_album)
                .delete(crate::routes::api::v1::auth::album::delete::delete_album),
        )
        .route(
            "/:album_id/link",
            put(crate::routes::api::v1::auth::album::update::link_files_to_album),
        )
        .route(
            "/:album_id/unlink",
            put(crate::routes::api::v1::auth::album::update::unlink_file_from_album),
        )
        .route(
            "/available",
            get(crate::routes::api::v1::auth::album::read::get_available_files),
        )
        .route(
            "/for/:file_id",
            get(crate::routes::api::v1::auth::album::read::get_available_albums_for_file),
        )
}

fn get_auth_router() -> KosmosRouter {
    Router::new()
        .route("/", get(crate::routes::api::v1::auth::auth))
        .route("/login", post(crate::routes::api::v1::auth::login))
        .route("/register", post(crate::routes::api::v1::auth::register))
        .route("/logout", post(crate::routes::api::v1::auth::logout))
        .nest("/search", get_search_router())
        .nest("/share", get_share_router())
        .nest("/file", get_file_router())
        .nest("/folder", get_folder_router())
        .nest("/favorite", get_favorite_router())
        .nest("/download", get_download_router())
        .nest("/multi", get_multi_router())
        .nest("/album", get_album_router())
        .nest("/operation", get_operation_router())
        .nest("/user", get_user_router())
        .nest("/admin", get_admin_router())
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
            "/file/:share_id/image/:format",
            get(crate::routes::api::v1::auth::file::image::get_share_image_by_format),
        )
        .route(
            "/folder/:share_id",
            get(crate::routes::api::v1::share::access_folder_share),
        )
        .route(
            "/folder/:share_id/multi",
            post(crate::routes::api::v1::auth::download::multi_share_download),
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
            get(
                crate::routes::api::v1::auth::file::image::get_share_image_by_format_through_folder,
            ),
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
