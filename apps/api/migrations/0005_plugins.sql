-- 0005_plugins.sql: Plugin registry and manifests
CREATE TABLE IF NOT EXISTS plugins (
    id           TEXT PRIMARY KEY,      -- e.g. "com.example.text-to-flowchart"
    name         TEXT NOT NULL,
    version      TEXT NOT NULL,
    manifest     JSONB NOT NULL,
    entry_url    TEXT NOT NULL,
    icon_url     TEXT,
    is_active    BOOLEAN NOT NULL DEFAULT true,
    installed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plugins_active ON plugins (is_active);
