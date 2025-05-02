use crate::model::internal::entity_id::EntityId;
use crate::model::profile::ProfileModelDTO;
use crate::response::error_handling::AppError;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::Json;
use axum_jwt_auth::Claims;
use crate::model::jwt::JwtClaims;

pub async fn get_profile_by_user_id(
    Claims(_claims): Claims<JwtClaims>,
    State(state): KosmosState,
    Path(user_id): Path<EntityId>,
) -> Result<Json<ProfileModelDTO>, AppError> {

    let profile = state
        .profile_service
        .get_profile_optional(user_id.into())
        .await?;

    match profile {
        None => Err(AppError::NotFound {
            error: "Profile not found".to_string(),
        }),
        Some(p) => Ok(Json(p.into())),
    }
}
