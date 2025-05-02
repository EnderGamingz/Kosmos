use crate::services::session_service::UserId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JwtUser {
    pub user_id: UserId,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JwtClaims {
    pub iss: String,
    pub sub: String,
    pub user: JwtUser,
    pub iat: u64,
    pub exp: u64,
}
