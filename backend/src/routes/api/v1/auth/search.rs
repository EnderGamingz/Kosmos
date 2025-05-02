use crate::model::jwt::JwtClaims;
use crate::response::error_handling::AppError;
use crate::services::search_service::ExplorerSearchDTO;
use crate::state::AppState;
use axum::extract::{Query, State};
use axum::Json;
use axum_jwt_auth::Claims;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Pagination {
    q: String,
}

pub async fn search(
    Claims(claims): Claims<JwtClaims>,
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<ExplorerSearchDTO>, AppError> {
    let data = state
        .search_service
        .search_explorer(claims.user.user_id, pagination.q)
        .await?;
    let data_dto = ExplorerSearchDTO {
        files: data.files.into_iter().map(|f| f.into()).collect(),
        folders: data.folders.into_iter().map(|f| f.into()).collect(),
    };

    Ok(Json(data_dto))
}
