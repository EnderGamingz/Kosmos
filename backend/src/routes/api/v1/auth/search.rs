use axum::extract::{Query, State};
use axum::Json;
use serde::Deserialize;
use tower_sessions::Session;

use crate::response::error_handling::AppError;
use crate::services::search_service::ExplorerSearchDTO;
use crate::services::session_service::SessionService;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct Pagination {
    q: String,
}

pub async fn search(
    State(state): State<AppState>,
    session: Session,
    Query(pagination): Query<Pagination>,
) -> Result<Json<ExplorerSearchDTO>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let data = state.search_service.search_explorer(user_id, pagination.q).await?;
    let data_dto = ExplorerSearchDTO {
        files: data.files.into_iter().map(|f| f.into()).collect(),
        folders: data.folders.into_iter().map(|f| f.into()).collect(),
    };

    Ok(Json(data_dto))
}