use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Plugin {
    pub id: String,
    pub name: String,
    pub version: String,
    pub manifest: serde_json::Value,
    pub entry_url: String,
    pub icon_url: Option<String>,
    pub is_active: bool,
    pub installed_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct InstallPluginDto {
    pub id: String,
    pub name: String,
    pub version: String,
    pub manifest: serde_json::Value,
    #[serde(rename = "entryUrl")]
    pub entry_url: String,
    #[serde(rename = "iconUrl")]
    pub icon_url: Option<String>,
}
