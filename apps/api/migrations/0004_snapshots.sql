-- 0004_snapshots.sql: Board versioned snapshots history
CREATE TABLE IF NOT EXISTS board_snapshots (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id   UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name       TEXT,                           -- Named snapshots (user-created)
    crdt_state BYTEA NOT NULL,
    auto       BOOLEAN NOT NULL DEFAULT true,  -- true = periodic auto-snapshot
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_snapshots_board ON board_snapshots (board_id, created_at DESC);
