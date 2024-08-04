use axum::extract::{Path, State};
use tower_sessions::Session;

use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn delete_album(
    State(state): KosmosState,
    session: Session,
    Path(album_id): Path<i64>,
) -> ResponseResult {
    let user_id = SessionService::check_logged_in(&session).await?;

    let album = state
        .album_service
        .get_album_by_id(Some(user_id), album_id)
        .await?;

    state.album_service.delete_album(user_id, album.id).await?;

    Ok(AppSuccess::DELETED)
}
