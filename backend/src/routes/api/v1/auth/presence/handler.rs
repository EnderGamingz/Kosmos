use crate::model::internal::presence::index::PresenceMessage;
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::presence::ping::socket_ping;
use crate::services::jwt_service::JWT_SERVICE;
use crate::services::session_service::UserId;
use crate::state::{AppState, KosmosState};
use axum::extract::ws::WebSocket;
use axum::extract::{State, WebSocketUpgrade};
use axum::http::HeaderMap;
use axum::response::Response;
use axum_jwt_auth::Claims;
use futures::{SinkExt, StreamExt};
use serde::Deserialize;
use sqlx::types::Uuid;
use tokio::sync::mpsc;

#[derive(Deserialize)]
pub struct PresenceStartQuery {
    token: String,
}

pub async fn presence_handler(
    State(state): KosmosState,
    headers: HeaderMap,
    ws: WebSocketUpgrade,
) -> Result<Response, AppError> {
    let request_token = headers
        .get("Sec-WebSocket-Protocol")
        .ok_or(AppError::BadRequest {
            error: Some("No token provided".to_string()),
        })?
        .to_str()
        .map_err(|_| AppError::BadRequest {
            error: Some("Token is not a string".to_string()),
        })?;

    let jwt_service = &JWT_SERVICE;

    let token_data = jwt_service
        .decoder
        .decoder
        .decode(request_token)
        .await
        .map_err(|_| AppError::InternalError)?;

    let claims = Claims(token_data.claims);

    let mut websocket_response =
        ws.on_upgrade(move |socket| handle_presence_socket(socket, claims.0.user.user_id, state));

    websocket_response
        .headers_mut()
        .insert("Sec-WebSocket-Protocol", request_token.parse()
            .map_err(|_| {
                AppError::BadRequest {
                    error: Some("Token is not a string".to_string()),
                }
            })?
        );

    Ok(websocket_response)
}

async fn handle_presence_socket(mut socket: WebSocket, user_id: UserId, state: AppState) {
    let connection_id = Uuid::new_v4().to_string();
    println!("New connection {}", connection_id);
    socket_ping(&mut socket).await.unwrap_or_else(|_| {
        return;
    });

    println!("Socket pinged");

    let (mut ws_tx, _ws_rx) = socket.split();
    let (tx, mut rx) = mpsc::channel::<PresenceMessage>(32);

    state
        .presence_handler
        .add_user(user_id, tx, connection_id.clone())
        .await;

    println!("User added");

    while let Some(message) = rx.recv().await {
        if ws_tx.send(message.into()).await.is_err() {
            break;
        }
        println!("Message sent");
    }

    state
        .presence_handler
        .remove_user_sender(user_id, connection_id)
        .await;
    println!("User removed");
}
