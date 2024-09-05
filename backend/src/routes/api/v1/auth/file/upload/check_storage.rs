use crate::response::error_handling::AppError;
use crate::services::usage_service::UsageService;

pub async fn check_user_storage_limit(
    usage_service: &UsageService,
    user_id: i64,
    limit: i64,
) -> Result<i64, AppError> {
    let storage_used = usage_service
        .get_user_storage_usage(user_id, None)
        .await?
        .get_sum();

    if limit - storage_used < 0 {
        return Err(AppError::BadRequest {
            error: Some("Storage limit exceeded".to_string()),
        });
    }

    Ok(limit - storage_used)
}