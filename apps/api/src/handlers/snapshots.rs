use crate::{
    errors::AppError,
    middleware::{AppState, AuthUser},
    models::{BoardSnapshot, CreateSnapshotDto},
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use uuid::Uuid;

pub async fn list_snapshots(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    // Check user access
    let access: Option<(Uuid,)> = sqlx::query_as(
        r#"
        SELECT b.id FROM boards b
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE b.id = $1 AND b.is_deleted = false
          AND (b.owner_id = $2 OR bm.user_id = $2 OR b.is_public = true)
        "#,
    )
    .bind(board_id)
    .bind(auth.id)
    .fetch_optional(&state.pool)
    .await?;

    if access.is_none() {
        return Err(AppError::NotFound("Board not found or access denied".to_string()));
    }

    let snapshots = sqlx::query_as::<_, BoardSnapshot>(
        "SELECT * FROM board_snapshots WHERE board_id = $1 ORDER BY created_at DESC"
    )
    .bind(board_id)
    .fetch_all(&state.pool)
    .await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": snapshots
        })),
    ))
}

pub async fn create_snapshot(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
    Json(payload): Json<CreateSnapshotDto>,
) -> Result<impl IntoResponse, AppError> {
    // Fetch current CRDT state
    let current_state: Option<(Vec<u8>,)> = sqlx::query_as(
        "SELECT crdt_state FROM board_states WHERE board_id = $1"
    )
    .bind(board_id)
    .fetch_optional(&state.pool)
    .await?;

    let crdt_state = current_state.map(|s| s.0).unwrap_or_default();

    let snapshot = sqlx::query_as::<_, BoardSnapshot>(
        r#"
        INSERT INTO board_snapshots (board_id, name, crdt_state, auto, created_by)
        VALUES ($1, $2, $3, false, $4)
        RETURNING *
        "#,
    )
    .bind(board_id)
    .bind(payload.name)
    .bind(crdt_state)
    .bind(auth.id)
    .fetch_one(&state.pool)
    .await?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "data": snapshot
        })),
    ))
}

pub async fn restore_snapshot(
    State(state): State<AppState>,
    auth: AuthUser,
    Path((board_id, snapshot_id)): Path<(Uuid, Uuid)>,
) -> Result<impl IntoResponse, AppError> {
    // Check editor permission
    let role: Option<(String,)> = sqlx::query_as(
        "SELECT role FROM board_members WHERE board_id = $1 AND user_id = $2"
    )
    .bind(board_id)
    .bind(auth.id)
    .fetch_optional(&state.pool)
    .await?;

    if !role.map(|r| r.0 == "owner" || r.0 == "editor").unwrap_or(false) {
        return Err(AppError::Forbidden("Only owners and editors can restore snapshots".to_string()));
    }

    let snapshot = sqlx::query_as::<_, BoardSnapshot>(
        "SELECT * FROM board_snapshots WHERE id = $1 AND board_id = $2"
    )
    .bind(snapshot_id)
    .bind(board_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Snapshot not found".to_string()))?;

    // Update board_states with snapshot's crdt_state and bump version
    sqlx::query(
        r#"
        UPDATE board_states
        SET crdt_state = $1, version = version + 1, updated_at = now()
        WHERE board_id = $2
        "#,
    )
    .bind(&snapshot.crdt_state)
    .bind(board_id)
    .execute(&state.pool)
    .await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": {
                "message": "Board successfully restored to snapshot",
                "snapshotId": snapshot.id
            }
        })),
    ))
}
