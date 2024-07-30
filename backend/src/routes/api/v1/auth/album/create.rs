use axum::extract::State;
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

use crate::model::album::AlbumModelDTO;
use crate::response::error_handling::AppError;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

#[derive(Deserialize)]
pub struct CreateAlbumPayload {
    pub name: String,
    pub description: Option<String>,
}

pub async fn create_album(
    State(state): KosmosState,
    session: Session,
    Json(payload): Json<CreateAlbumPayload>,
) -> Result<Json<AlbumModelDTO>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let album = state
        .album_service
        .create_album(user_id, payload.name, payload.description)
        .await?;

    Ok(Json(album.into()))
}
