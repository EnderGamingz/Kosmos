use crate::model::internal::image_format::ImageFormat;
use crate::response::error_handling::AppError;
use crate::routes::api::v1::auth::file::image::get_image_format_data;
use crate::services::session_service::SessionService;
use crate::state::KosmosState;
use axum::extract::{Path, State};
use axum::response::{IntoResponse, Response};
use tower_sessions::Session;

pub async fn get_avatar_by_user_id(
    State(state): KosmosState,
    session: Session,
    Path(user_id): Path<i64>,
) -> Result<Response, AppError> {
    SessionService::check_logged_in(&session).await?;
    let user = state
        .user_service
        .get_user(user_id)
        .await?
        .ok_or(AppError::NotFound {
            error: "User not found".to_string(),
        })?;

    let file_id = match user.avatar_image_id {
        None => {
            return Err(AppError::NotFound {
                error: "User has no avatar image".to_string(),
            });
        }
        Some(id) => id,
    };

    let file_data = state.file_service.get_file(file_id, None).await?;

    let (image, headers) = get_image_format_data(ImageFormat::Thumbnail, &file_data).await?;

    Ok((headers, image).into_response())
}
