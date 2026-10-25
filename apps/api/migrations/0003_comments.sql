-- 0003_comments.sql: Board comments and message threads
CREATE TABLE IF NOT EXISTS comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    object_id   TEXT,              -- Canvas object ID (NULL for canvas-level comment)
    canvas_x    FLOAT,
    canvas_y    FLOAT,
    resolved    BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_board ON comments (board_id);

CREATE TABLE IF NOT EXISTS comment_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id  UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES users(id),
    text        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comment_messages_comment ON comment_messages (comment_id);
