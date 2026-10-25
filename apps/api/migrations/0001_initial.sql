-- 0001_initial.sql: Initial schema for users, oauth, boards, board_states, and board_members
-- Extension for UUID generation and cryptographic random bytes
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    display_name  TEXT NOT NULL,
    avatar_url    TEXT,
    cursor_color  TEXT NOT NULL DEFAULT '#6366f1',
    password_hash TEXT,           -- NULL for OAuth-only accounts
    tier          TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- OAuth Identities
CREATE TABLE IF NOT EXISTS oauth_identities (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider         TEXT NOT NULL CHECK (provider IN ('github', 'google')),
    provider_user_id TEXT NOT NULL,
    email            TEXT NOT NULL,
    access_token_enc TEXT NOT NULL,   -- Encrypted with app secret
    refresh_token_enc TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_identities_user_id ON oauth_identities (user_id);

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL DEFAULT 'Untitled Board',
    workspace_type  TEXT NOT NULL DEFAULT 'whiteboard',
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_public       BOOLEAN NOT NULL DEFAULT false,
    share_token     TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    settings        JSONB NOT NULL DEFAULT '{}',
    thumbnail_url   TEXT,
    is_deleted      BOOLEAN NOT NULL DEFAULT false,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boards_owner ON boards (owner_id) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_boards_share_token ON boards (share_token);

-- Current Yjs CRDT state snapshot per board
CREATE TABLE IF NOT EXISTS board_states (
    board_id    UUID PRIMARY KEY REFERENCES boards(id) ON DELETE CASCADE,
    crdt_state  BYTEA NOT NULL,          -- Binary Yjs state
    version     BIGINT NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Board membership and roles
CREATE TABLE IF NOT EXISTS board_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'commenter', 'viewer')),
    invited_by  UUID REFERENCES users(id),
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (board_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_board_members_user ON board_members (user_id);
CREATE INDEX IF NOT EXISTS idx_board_members_board ON board_members (board_id);
