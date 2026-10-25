use crate::middleware::AppState;
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;

pub async fn alive() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "status": "ok",
            "service": "codrawithm-api",
            "timestamp": chrono::Utc::now().to_rfc3339()
        })),
    )
}

pub async fn ready(State(state): State<AppState>) -> impl IntoResponse {
    match sqlx::query("SELECT 1").execute(&state.pool).await {
        Ok(_) => (
            StatusCode::OK,
            Json(json!({
                "status": "ready",
                "database": "connected",
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
        ),
        Err(e) => {
            tracing::error!("Readiness probe database error: {:?}", e);
            (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(json!({
                    "status": "not_ready",
                    "database": "disconnected",
                    "error": e.to_string()
                })),
            )
        }
    }
}
