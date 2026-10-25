-- 0006_ai_audit.sql: AI request and usage audit logging
CREATE TABLE IF NOT EXISTS ai_audit_log (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES users(id),
    board_id         UUID REFERENCES boards(id),
    provider         TEXT NOT NULL,
    mode             TEXT NOT NULL,
    prompt_chars     INTEGER,
    response_objects INTEGER,
    tokens_used      INTEGER,
    outcome          TEXT,              -- accepted | regenerated | discarded | error
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_audit_user ON ai_audit_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_audit_board ON ai_audit_log (board_id);
