-- 0002_assets.sql: Board assets (images, uploads, media)
CREATE TABLE IF NOT EXISTS assets (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id      UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    uploaded_by   UUID REFERENCES users(id),
    s3_key        TEXT NOT NULL UNIQUE,
    mime_type     TEXT NOT NULL,
    file_size     BIGINT NOT NULL,
    original_name TEXT,
    width         INTEGER,
    height        INTEGER,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_board ON assets (board_id);
CREATE INDEX IF NOT EXISTS idx_assets_uploaded_by ON assets (uploaded_by);
