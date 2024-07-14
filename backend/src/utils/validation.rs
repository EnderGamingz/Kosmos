use crate::response::error_handling::AppError;
use crate::utils::string;

pub fn verify_username(username: &str) -> Result<String, AppError> {
    let username = string::remove_whitespace(&username);

    if username.len() < 4 || username.len() > 255 {
        Err(AppError::BadRequest {
            error: Some("Username length must be between 4 and 255".to_string()),
        })?;
    }

    Ok(username)
}

pub fn validate_password(password: &str) -> Result<(), AppError> {
    if password.len() < 8 || password.len() > 255 {
        Err(AppError::BadRequest {
            error: Some("Password too short".to_string()),
        })?;
    }
    Ok(())
}