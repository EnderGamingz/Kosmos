use crate::model::file::FileModelDTO;
use crate::model::folder::FolderModelDTO;
use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;
use serde::Serialize;
use ts_rs::TS;

#[derive(Serialize, TS)]
#[ts(export)]
pub struct FavoritesResponse {
    folders: Vec<FolderModelDTO>,
    files: Vec<FileModelDTO>,
}

pub async fn get_favorites(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
) -> Result<Json<FavoritesResponse>, AppError> {
    let favorites = FavoritesResponse {
        folders: state
            .folder_service
            .get_favorites(claims.user.user_id)
            .await?
            .into_iter()
            .map(FolderModelDTO::from)
            .collect(),
        files: state
            .file_service
            .get_favorites(claims.user.user_id)
            .await?
            .into_iter()
            .map(FileModelDTO::from)
            .collect(),
    };

    Ok(Json(favorites))
}
