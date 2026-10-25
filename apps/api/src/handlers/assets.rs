use crate::{
    errors::AppError,
    middleware::{AppState, AuthUser},
    models::{Asset, AssetUploadUrlRequest, AssetUploadUrlResponse, ConfirmAssetDto},
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use uuid::Uuid;

pub async fn get_upload_url(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
    Json(payload): Json<AssetUploadUrlRequest>,
) -> Result<impl IntoResponse, AppError> {
    let asset_id = Uuid::new_v4();
    let s3_key = format!("boards/{}/{}_{}", board_id, asset_id, payload.file_name);
    let upload_url = format!("https://storage.codrawithm.local/upload/{}", s3_key);

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": AssetUploadUrlResponse {
                upload_url,
                asset_id,
                s3_key,
            }
        })),
    ))
}

pub async fn confirm_asset(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
    Json(payload): Json<ConfirmAssetDto>,
) -> Result<impl IntoResponse, AppError> {
    let asset = sqlx::query_as::<_, Asset>(
        r#"
        INSERT INTO assets (id, board_id, uploaded_by, s3_key, mime_type, file_size, original_name, width, height)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        "#,
    )
    .bind(payload.asset_id)
    .bind(board_id)
    .bind(auth.id)
    .bind(payload.s3_key)
    .bind(payload.mime_type)
    .bind(payload.file_size)
    .bind(payload.original_name)
    .bind(payload.width)
    .bind(payload.height)
    .fetch_one(&state.pool)
    .await?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "data": asset
        })),
    ))
}

pub async fn list_assets(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let assets = sqlx::query_as::<_, Asset>(
        "SELECT * FROM assets WHERE board_id = $1 ORDER BY created_at DESC"
    )
    .bind(board_id)
    .fetch_all(&state.pool)
    .await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": assets
        })),
    ))
}

pub async fn delete_asset(
    State(state): State<AppState>,
    auth: AuthUser,
    Path((board_id, asset_id)): Path<(Uuid, Uuid)>,
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query(
        "DELETE FROM assets WHERE id = $1 AND board_id = $2"
    )
    .bind(asset_id)
    .bind(board_id)
    .execute(&state.pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Asset not found".to_string()));
    }

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": {
                "message": "Asset deleted successfully"
            }
        })),
    ))
}
