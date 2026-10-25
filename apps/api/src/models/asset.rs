use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Asset {
    pub id: Uuid,
    pub board_id: Uuid,
    pub uploaded_by: Option<Uuid>,
    pub s3_key: String,
    pub mime_type: String,
    pub file_size: i64,
    pub original_name: Option<String>,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct AssetUploadUrlRequest {
    #[serde(rename = "fileName")]
    pub file_name: String,
    #[serde(rename = "mimeType")]
    pub mime_type: String,
    #[serde(rename = "fileSize")]
    pub file_size: i64,
}

#[derive(Debug, Serialize)]
pub struct AssetUploadUrlResponse {
    #[serde(rename = "uploadUrl")]
    pub upload_url: String,
    #[serde(rename = "assetId")]
    pub asset_id: Uuid,
    #[serde(rename = "s3Key")]
    pub s3_key: String,
}

#[derive(Debug, Deserialize)]
pub struct ConfirmAssetDto {
    #[serde(rename = "assetId")]
    pub asset_id: Uuid,
    #[serde(rename = "s3Key")]
    pub s3_key: String,
    #[serde(rename = "originalName")]
    pub original_name: Option<String>,
    #[serde(rename = "mimeType")]
    pub mime_type: String,
    #[serde(rename = "fileSize")]
    pub file_size: i64,
    pub width: Option<i32>,
    pub height: Option<i32>,
}
