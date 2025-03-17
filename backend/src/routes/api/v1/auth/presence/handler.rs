use crate::model::internal::presence::index::PresenceMessage;
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::presence::ping::socket_ping;
use crate::services::session_service::SessionService;
use crate::state::{AppState, KosmosState};
use axum::extract::ws::WebSocket;
use axum::extract::{State, WebSocketUpgrade};
use axum::response::Response;
use futures::{SinkExt, StreamExt};
use sqlx::types::{Uuid};
use tokio::sync::mpsc;
use tower_sessions::Session;

pub async fn presence_handler(
    State(state): KosmosState,
    session: Session,
    ws: WebSocketUpgrade,
) -> Result<Response, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    Ok(ws.on_upgrade(move |socket| handle_presence_socket(socket, user_id, state)))
}

async fn handle_presence_socket(mut socket: WebSocket, user_id: i64, state: AppState) {
    let connection_id = Uuid::new_v4().to_string();
    socket_ping(&mut socket).await.unwrap_or_else(|_| {
        return;
    });

    let (mut ws_tx, _ws_rx) = socket.split();
    let (tx, mut rx) = mpsc::channel::<PresenceMessage>(32);

    state
        .presence_handler
        .add_user(user_id, tx, connection_id.clone())
        .await;

    while let Some(message) = rx.recv().await {
        if ws_tx.send(message.into()).await.is_err() {
            break;
        }
    }

    state
        .presence_handler
        .remove_user_sender(user_id, connection_id)
        .await;
}
