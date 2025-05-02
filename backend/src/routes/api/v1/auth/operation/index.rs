use crate::model::jwt::JwtClaims;
use crate::model::operation::OperationModelDTO;
use crate::response::error_handling::AppError;
use crate::state::KosmosState;
use axum::extract::State;
use axum::Json;
use axum_jwt_auth::Claims;

pub async fn get_all_operations(
    Claims(claims): Claims<JwtClaims>,
    State(state): KosmosState,
) -> Result<Json<Vec<OperationModelDTO>>, AppError> {
    let operations = state
        .operation_service
        .get_operations_by_user_id(claims.user.user_id, 20)
        .await?
        .into_iter()
        .map(OperationModelDTO::from)
        .collect::<Vec<_>>();

    Ok(Json(operations))
}
