use axum::extract::State;
use axum::Json;
use tower_sessions::Session;
use crate::model::operation::ParsedOperationModel;
use crate::response::error_handling::AppError;
use crate::services::operation_service::OperationService;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;

pub async fn get_all_operations(
    State(state): KosmosState,
    session: Session,
) -> Result<Json<Vec<ParsedOperationModel>>, AppError> {
    let user_id = SessionService::check_logged_in(&session).await?;

    let operations = state
        .operation_service
        .get_operations_by_user_id(user_id, 20)
        .await?
        .into_iter()
        .map(OperationService::parse_operation)
        .collect::<Vec<_>>();

    Ok(Json(operations))
}
