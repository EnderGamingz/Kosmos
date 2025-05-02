use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;
use serde::Deserialize;

use crate::model::album::AlbumModelDTO;
use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::state::KosmosState;

#[derive(Deserialize)]
pub struct CreateAlbumPayload {
    pub name: String,
    pub description: Option<String>,
}

pub async fn create_album(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Json(payload): Json<CreateAlbumPayload>,
) -> Result<Json<AlbumModelDTO>, AppError> {
    let album = state
        .album_service
        .create_album(claims.user.user_id, payload.name, payload.description)
        .await?;

    Ok(Json(album.into()))
}
