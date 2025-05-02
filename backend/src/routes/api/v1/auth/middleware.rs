use crate::response::error_handling::AppError;
use crate::services::jwt_service::JWT_SERVICE;
use axum::body::Body;
use axum::extract::Request;
use axum::http;
use axum::middleware::Next;
use axum::response::Response;

pub async fn authorization_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response<Body>, AppError> {
    let auth_header = req.headers_mut().get(http::header::AUTHORIZATION);
    let auth_header = match auth_header {
        Some(header) => header.to_str().map_err(|_e| AppError::Forbidden {
            error: Some("Header must not be empty".to_string()),
        })?,
        None => {
            return Err(AppError::Forbidden {
                error: Some("JWT must be set".to_string()),
            });
        }
    };
    let mut header = auth_header.split_whitespace();
    let (_bearer, token) = (header.next(), header.next());
    let jwt_service = &JWT_SERVICE;
    let user_id = if let Some(token) = token {
        Some(
            jwt_service
                .decoder
                .decoder
                .decode(token)
                .await
                .map(|res| res.claims.user.user_id)
                .map_err(|_e| AppError::InternalError)?,
        )
    } else {
        None
    };

    req.extensions_mut().insert(user_id);
    Ok(next.run(req).await)
}
