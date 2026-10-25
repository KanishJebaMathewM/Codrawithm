use crate::{
    errors::AppError,
    middleware::{AppState, AuthUser},
    models::{Comment, CommentMessage, CreateCommentDto, CreateMessageDto},
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use uuid::Uuid;

pub async fn list_comments(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let comments = sqlx::query_as::<_, Comment>(
        "SELECT * FROM comments WHERE board_id = $1 ORDER BY created_at ASC"
    )
    .bind(board_id)
    .fetch_all(&state.pool)
    .await?;

    let messages = sqlx::query_as::<_, CommentMessage>(
        r#"
        SELECT cm.* FROM comment_messages cm
        JOIN comments c ON cm.comment_id = c.id
        WHERE c.board_id = $1
        ORDER BY cm.created_at ASC
        "#,
    )
    .bind(board_id)
    .fetch_all(&state.pool)
    .await?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": {
                "comments": comments,
                "messages": messages
            }
        })),
    ))
}

pub async fn create_comment(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
    Json(payload): Json<CreateCommentDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut tx = state.pool.begin().await?;

    let comment = sqlx::query_as::<_, Comment>(
        r#"
        INSERT INTO comments (board_id, object_id, canvas_x, canvas_y)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
    )
    .bind(board_id)
    .bind(payload.object_id)
    .bind(payload.canvas_x)
    .bind(payload.canvas_y)
    .fetch_one(&mut *tx)
    .await?;

    let message = sqlx::query_as::<_, CommentMessage>(
        r#"
        INSERT INTO comment_messages (comment_id, author_id, text)
        VALUES ($1, $2, $3)
        RETURNING *
        "#,
    )
    .bind(comment.id)
    .bind(auth.id)
    .bind(payload.text)
    .fetch_one(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "data": {
                "comment": comment,
                "message": message
            }
        })),
    ))
}

pub async fn add_message(
    State(state): State<AppState>,
    auth: AuthUser,
    Path((_board_id, comment_id)): Path<(Uuid, Uuid)>,
    Json(payload): Json<CreateMessageDto>,
) -> Result<impl IntoResponse, AppError> {
    let message = sqlx::query_as::<_, CommentMessage>(
        r#"
        INSERT INTO comment_messages (comment_id, author_id, text)
        VALUES ($1, $2, $3)
        RETURNING *
        "#,
    )
    .bind(comment_id)
    .bind(auth.id)
    .bind(payload.text)
    .fetch_one(&state.pool)
    .await?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "data": message
        })),
    ))
}

pub async fn resolve_comment(
    State(state): State<AppState>,
    auth: AuthUser,
    Path((_board_id, comment_id)): Path<(Uuid, Uuid)>,
) -> Result<impl IntoResponse, AppError> {
    let comment = sqlx::query_as::<_, Comment>(
        r#"
        UPDATE comments
        SET resolved = true, resolved_by = $1, resolved_at = now()
        WHERE id = $2
        RETURNING *
        "#,
    )
    .bind(auth.id)
    .bind(comment_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Comment not found".to_string()))?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "data": comment
        })),
    ))
}
