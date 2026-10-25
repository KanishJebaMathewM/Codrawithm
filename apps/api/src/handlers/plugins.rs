use crate::{
    errors::AppError,
    middleware::{AppState, AuthUser},
    models::{InstallPluginDto, Plugin},
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;

pub async fn list_plugins(State(state): State<AppState>) -> Result<impl IntoResponse, AppError> {
    let plugins = sqlx::query_as::<_, Plugin>(
        "SELECT * FROM plugins WHERE is_active = true ORDER BY name ASC"
    )
    .fetch_all(&state.pool)
    .await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": plugins
        })),
    ))
}

pub async fn get_plugin(
    State(state): State<AppState>,
    Path(plugin_id): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let plugin = sqlx::query_as::<_, Plugin>(
        "SELECT * FROM plugins WHERE id = $1 AND is_active = true"
    )
    .bind(plugin_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Plugin not found".to_string()))?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": plugin
        })),
    ))
}

pub async fn install_plugin(
    State(state): State<AppState>,
    _auth: AuthUser,
    Json(payload): Json<InstallPluginDto>,
) -> Result<impl IntoResponse, AppError> {
    let plugin = sqlx::query_as::<_, Plugin>(
        r#"
        INSERT INTO plugins (id, name, version, manifest, entry_url, icon_url, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            version = EXCLUDED.version,
            manifest = EXCLUDED.manifest,
            entry_url = EXCLUDED.entry_url,
            icon_url = EXCLUDED.icon_url,
            is_active = true
        RETURNING *
        "#,
    )
    .bind(payload.id)
    .bind(payload.name)
    .bind(payload.version)
    .bind(payload.manifest)
    .bind(payload.entry_url)
    .bind(payload.icon_url)
    .fetch_one(&state.pool)
    .await?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "data": plugin
        })),
    ))
}

pub async fn uninstall_plugin(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(plugin_id): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query(
        "UPDATE plugins SET is_active = false WHERE id = $1"
    )
    .bind(plugin_id)
    .execute(&state.pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Plugin not found".to_string()));
    }

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": {
                "message": "Plugin deactivated successfully"
            }
        })),
    ))
}
