use crate::model::album::AlbumModelWithShareInfoDTO;
use crate::model::file::FileModelWithShareInfoDTO;
use crate::model::folder::FolderModelWithShareInfoDTO;
use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::services::session_service::UserId;
use crate::state::{AppState, KosmosState};
use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;
use serde::Serialize;
use ts_rs::TS;

#[derive(Serialize, TS)]
#[ts(export)]
pub struct SharedItems {
    files: Vec<FileModelWithShareInfoDTO>,
    folders: Vec<FolderModelWithShareInfoDTO>,
    albums: Vec<AlbumModelWithShareInfoDTO>,
}

impl SharedItems {
    async fn get_shared_files_and_folders(
        state: &AppState,
        user_id: &UserId,
        targeted: bool,
    ) -> Result<SharedItems, AppError> {
        let files: Vec<FileModelWithShareInfoDTO> = state
            .share_service
            .get_shared_files(user_id, targeted)
            .await?
            .into_iter()
            .map(FileModelWithShareInfoDTO::from)
            .collect::<Vec<_>>();

        let folders = state
            .share_service
            .get_shared_folders(user_id, targeted)
            .await?
            .into_iter()
            .map(FolderModelWithShareInfoDTO::from)
            .collect::<Vec<_>>();

        let albums = state
            .share_service
            .get_shared_albums(user_id)
            .await?
            .into_iter()
            .map(AlbumModelWithShareInfoDTO::from)
            .collect::<Vec<_>>();

        Ok(SharedItems {
            files,
            folders,
            albums,
        })
    }
}

pub async fn get_shared_items(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
) -> Result<Json<SharedItems>, AppError> {
    let shared =
        SharedItems::get_shared_files_and_folders(&state, &claims.user.user_id, false).await?;
    Ok(Json(shared))
}

pub async fn get_targeted_shared_items_for_user(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
) -> Result<Json<SharedItems>, AppError> {
    let shared =
        SharedItems::get_shared_files_and_folders(&state, &claims.user.user_id, true).await?;
    Ok(Json(shared))
}
