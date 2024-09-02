use axum::http::header::{
    ACCESS_CONTROL_ALLOW_CREDENTIALS, ACCESS_CONTROL_EXPOSE_HEADERS, CONTENT_DISPOSITION,
    CONTENT_TYPE,
};
use axum::http::{HeaderValue, Method};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

use crate::db::KosmosPool;

pub mod db;
pub mod model;
pub mod response;
pub mod routes;
pub mod services;
pub mod session;

mod constants;
mod folders;
mod router;
mod runtimes;
mod state;
mod utils;
mod webauthn;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    // Clear console
    print!("\x1B[2J\x1B[1;1H");

    tracing_subscriber::fmt()
        .pretty()
        .with_target(false)
        .with_level(true)
        .with_file(false)
        .with_line_number(false)
        .compact()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    tracing::info!(name: "bootstrap", "Starting bootstrap process");

    std::env::var("UPLOAD_LOCATION").expect("UPLOAD_LOCATION must be set");

    let cors_origin = std::env::var("CORS_ORIGIN")
        .expect("CORS_ORIGIN must be set")
        .parse::<HeaderValue>()
        .unwrap();

    tracing::info!(name: "bootstrap", "CORS_ORIGIN: {}", cors_origin.to_str().unwrap());

    let cors = CorsLayer::new()
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::DELETE,
            Method::PATCH,
            Method::PUT,
        ])
        .allow_origin(cors_origin)
        .allow_headers([
            CONTENT_TYPE,
            ACCESS_CONTROL_ALLOW_CREDENTIALS,
            ACCESS_CONTROL_EXPOSE_HEADERS,
        ])
        .expose_headers([CONTENT_DISPOSITION])
        .allow_credentials(true);

    let session_layer = session::init();

    let db = db::init().await;

    let webauthn = webauthn::init();

    tracing::info!(name: "bootstrap", "Starting server");

    let state = state::init(&db, &webauthn);

    state.operation_service.startup_prepare().await;
    state.file_service.startup_prepare().await;

    let router = router::init(cors, session_layer, state);

    folders::init().await;

    let port = std::env::var("PORT").unwrap_or(5000.to_string());

    let socket_addr = SocketAddr::from(([0, 0, 0, 0], port.parse().unwrap()));
    let listener = tokio::net::TcpListener::bind(&socket_addr).await.unwrap();

    tracing::info!(name: "bootstrap", "Listening on {}", socket_addr);

    axum::serve(listener, router.into_make_service())
        .await
        .unwrap()
}
