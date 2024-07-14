use crate::response::error_handling::AppError;

pub fn hash_password(password: &str) -> Result<String, AppError> {
    bcrypt::hash(password, bcrypt::DEFAULT_COST).map_err(|e| {
        tracing::error!("Error while hashing password: {}", e);
        AppError::InternalError
    })
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, AppError> {
    bcrypt::verify(password, hash).map_err(|e| {
        tracing::error!("Error while verifying password: {}", e);
        AppError::InternalError
    })
}