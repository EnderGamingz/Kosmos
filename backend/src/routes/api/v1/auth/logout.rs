use crate::model::jwt::JwtClaims;
use crate::response::success_handling::{AppSuccess, ResponseResult};
use axum_jwt_auth::Claims;

pub async fn logout(Claims(_claims): Claims<JwtClaims>) -> ResponseResult {
    Ok(AppSuccess::OK { data: None })
}
