use crate::{
    errors::AppError,
    middleware::{AppState, AuthUser},
    models::{Board, CreateBoardDto, UpdateBoardDto},
};
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use serde_json::json;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct ListBoardsQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

pub async fn list_boards(
    State(state): State<AppState>,
    auth: AuthUser,
    Query(query): Query<ListBoardsQuery>,
) -> Result<impl IntoResponse, AppError> {
    let limit = query.limit.unwrap_or(20).clamp(1, 100);
    let offset = query.offset.unwrap_or(0).max(0);

    let boards = sqlx::query_as::<_, Board>(
        r#"
        SELECT DISTINCT b.*
        FROM boards b
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE (b.owner_id = $1 OR bm.user_id = $1)
          AND b.is_deleted = false
        ORDER BY b.updated_at DESC
        LIMIT $2 OFFSET $3
        "#,
    )
    .bind(auth.id)
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.pool)
    .await?;

    let total: (i64,) = sqlx::query_as(
        r#"
        SELECT COUNT(DISTINCT b.id)
        FROM boards b
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE (b.owner_id = $1 OR bm.user_id = $1)
          AND b.is_deleted = false
        "#,
    )
    .bind(auth.id)
    .fetch_one(&state.pool)
    .await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": boards,
            "meta": {
                "total": total.0,
                "limit": limit,
                "offset": offset,
                "hasMore": (offset + (boards.len() as i64)) < total.0
            }
        })),
    ))
}

pub async fn create_board(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(payload): Json<CreateBoardDto>,
) -> Result<impl IntoResponse, AppError> {
    let title = payload
        .title
        .filter(|t| !t.trim().is_empty())
        .unwrap_or_else(|| "Untitled Board".to_string());
    let workspace_type = payload
        .workspace_type
        .unwrap_or_else(|| "whiteboard".to_string());
    let is_public = payload.is_public.unwrap_or(false);
    let settings = payload.settings.unwrap_or_else(|| json!({}));

    let mut tx = state.pool.begin().await?;

    let board = sqlx::query_as::<_, Board>(
        r#"
        INSERT INTO boards (title, workspace_type, owner_id, is_public, settings)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        "#,
    )
    .bind(title)
    .bind(workspace_type)
    .bind(auth.id)
    .bind(is_public)
    .bind(settings)
    .fetch_one(&mut *tx)
    .await?;

    // Initialize board_states with empty CRDT state
    sqlx::query(
        r#"
        INSERT INTO board_states (board_id, crdt_state, version)
        VALUES ($1, $2, 0)
        "#,
    )
    .bind(board.id)
    .bind(Vec::<u8>::new())
    .execute(&mut *tx)
    .await?;

    // Add creator as owner in board_members
    sqlx::query(
        r#"
        INSERT INTO board_members (board_id, user_id, role, invited_by)
        VALUES ($1, $2, 'owner', $2)
        "#,
    )
    .bind(board.id)
    .bind(auth.id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "data": board
        })),
    ))
}

pub async fn get_board(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let board = sqlx::query_as::<_, Board>(
        r#"
        SELECT b.*
        FROM boards b
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE b.id = $1
          AND b.is_deleted = false
          AND (b.owner_id = $2 OR bm.user_id = $2 OR b.is_public = true)
        "#,
    )
    .bind(board_id)
    .bind(auth.id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Board not found or access denied".to_string()))?;

    // Fetch state version
    let state_version: Option<(i64,)> = sqlx::query_as(
        "SELECT version FROM board_states WHERE board_id = $1"
    )
    .bind(board_id)
    .fetch_optional(&state.pool)
    .await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": {
                "board": board,
                "version": state_version.map(|v| v.0).unwrap_or(0)
            }
        })),
    ))
}

pub async fn update_board(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
    Json(payload): Json<UpdateBoardDto>,
) -> Result<impl IntoResponse, AppError> {
    // Check permission: user must be owner or editor
    let member_role: Option<(String,)> = sqlx::query_as(
        r#"
        SELECT role FROM board_members
        WHERE board_id = $1 AND user_id = $2
        "#,
    )
    .bind(board_id)
    .bind(auth.id)
    .fetch_optional(&state.pool)
    .await?;

    let is_authorized = member_role
        .map(|r| r.0 == "owner" || r.0 == "editor")
        .unwrap_or(false);

    if !is_authorized {
        return Err(AppError::Forbidden("Insufficient permissions to modify board".to_string()));
    }

    let board = sqlx::query_as::<_, Board>(
        r#"
        UPDATE boards
        SET
            title = COALESCE($1, title),
            workspace_type = COALESCE($2, workspace_type),
            is_public = COALESCE($3, is_public),
            settings = COALESCE($4, settings),
            thumbnail_url = COALESCE($5, thumbnail_url),
            updated_at = now()
        WHERE id = $6 AND is_deleted = false
        RETURNING *
        "#,
    )
    .bind(payload.title)
    .bind(payload.workspace_type)
    .bind(payload.is_public)
    .bind(payload.settings)
    .bind(payload.thumbnail_url)
    .bind(board_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Board not found".to_string()))?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": board
        })),
    ))
}

pub async fn delete_board(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query(
        r#"
        UPDATE boards
        SET is_deleted = true, deleted_at = now(), updated_at = now()
        WHERE id = $1 AND owner_id = $2 AND is_deleted = false
        "#,
    )
    .bind(board_id)
    .bind(auth.id)
    .execute(&state.pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(
            "Board not found or you are not the owner".to_string(),
        ));
    }

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": {
                "message": "Board deleted successfully"
            }
        })),
    ))
}

pub async fn get_by_share_token(
    State(state): State<AppState>,
    Path(share_token): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let board = sqlx::query_as::<_, Board>(
        r#"
        SELECT * FROM boards
        WHERE share_token = $1 AND is_deleted = false
        "#,
    )
    .bind(share_token)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Board not found with provided share token".to_string()))?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": board
        })),
    ))
}

pub async fn duplicate_board(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let original = sqlx::query_as::<_, Board>(
        r#"
        SELECT b.* FROM boards b
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE b.id = $1 AND b.is_deleted = false
          AND (b.owner_id = $2 OR bm.user_id = $2 OR b.is_public = true)
        "#,
    )
    .bind(board_id)
    .bind(auth.id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Original board not found or accessible".to_string()))?;

    let original_state: Option<(Vec<u8>,)> = sqlx::query_as(
        "SELECT crdt_state FROM board_states WHERE board_id = $1"
    )
    .bind(board_id)
    .fetch_optional(&state.pool)
    .await?;

    let mut tx = state.pool.begin().await?;

    let new_title = format!("{} (Copy)", original.title);

    let new_board = sqlx::query_as::<_, Board>(
        r#"
        INSERT INTO boards (title, workspace_type, owner_id, is_public, settings)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        "#,
    )
    .bind(new_title)
    .bind(original.workspace_type)
    .bind(auth.id)
    .bind(original.is_public)
    .bind(original.settings)
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query(
        r#"
        INSERT INTO board_states (board_id, crdt_state, version)
        VALUES ($1, $2, 0)
        "#,
    )
    .bind(new_board.id)
    .bind(original_state.map(|s| s.0).unwrap_or_default())
    .execute(&mut *tx)
    .await?;

    sqlx::query(
        r#"
        INSERT INTO board_members (board_id, user_id, role, invited_by)
        VALUES ($1, $2, 'owner', $2)
        "#,
    )
    .bind(new_board.id)
    .bind(auth.id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "data": new_board
        })),
    ))
}
