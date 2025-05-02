use crate::model::jwt::JwtClaims;
use crate::model::user::UserModel;
use crate::response::error_handling::AppError;
use axum_jwt_auth::{JwtDecoderState, LocalDecoder};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use lazy_static::lazy_static;
use std::sync::Arc;

lazy_static! {
    pub static ref JWT_SERVICE: JwtService = JwtService::new();
}

#[derive(Clone)]
pub struct JwtService {
    pub encoding_key: EncodingKey,
    pub decoder: JwtDecoderState<JwtClaims>,
    header: Header,
    pub issuer: String,
}

impl JwtService {
    fn new() -> Self {
        let env_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
        let env_issuer = std::env::var("JWT_ISSUER").expect("JWT_ISSUER must be set");
        let env_audience = std::env::var("JWT_AUDIENCE").expect("JWT_AUDIENCE must be set");
        let decoding_key = DecodingKey::from_secret(env_secret.as_bytes());
        let encoding_key = EncodingKey::from_secret(env_secret.as_bytes());

        let mut header = Header::default();
        header.alg = Algorithm::HS256;
        header.typ = Some("JWT".to_string());
        header.cty = Some("JWT".to_string());

        let mut validation = Validation::default();
        validation.set_audience(&[env_audience]);
        let decoder = LocalDecoder::builder()
            .keys(vec![decoding_key.clone()])
            .validation(validation)
            .build()
            .expect("Failed to create jwt decoder");

        Self {
            encoding_key,
            header,
            issuer: env_issuer,
            decoder: JwtDecoderState {
                decoder: Arc::new(decoder),
            },
        }
    }

    pub fn login_user(user: UserModel) -> Result<String, AppError> {
        let jwt_service = &JWT_SERVICE;
        let exp = Utc::now() + Duration::days(30);

        let claims = JwtClaims {
            iss: jwt_service.issuer.clone(),
            sub: user.id.to_string(),
            user: user.into(),
            iat: Utc::now().timestamp() as u64,
            exp: exp.timestamp() as u64,
        };

        encode::<JwtClaims>(&jwt_service.header, &claims, &jwt_service.encoding_key).map_err(|e| {
            tracing::error!("Failed to encode jwt: {}", e);
            AppError::InternalError
        })
    }
}
