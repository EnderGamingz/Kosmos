use crate::model::jwt::JwtClaims;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum_jwt_auth::Claims;

pub async fn delete_album(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(album_id): Path<i64>,
) -> ResponseResult {
    let album = state
        .album_service
        .get_album_by_id(Some(claims.user.user_id), album_id)
        .await?;

    state
        .album_service
        .delete_album(claims.user.user_id, album.id)
        .await?;

    Ok(AppSuccess::DELETED)
}
