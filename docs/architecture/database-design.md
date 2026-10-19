# Database Design

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm uses **PostgreSQL 16** as its primary database. Board canvas state is stored as JSONB (JSON Binary) for flexibility, with structured relational columns for queryable metadata.

See [ADR-010](architecture-decisions/ADR-010-database-and-storage.md) for the technology decision.

---

## Schema Overview

```
users
  └─< oauth_identities
boards
  └─< board_members (users)
  └─< board_states (CRDT snapshots)
  └─< board_snapshots (versioned history)
  └─< assets
  └─< comments
       └─< comment_messages
plugins (registry)
```

---

## Table Definitions

### `users`

```sql
CREATE TABLE users (
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

CREATE INDEX idx_users_email ON users (email);
```

### `oauth_identities`

```sql
CREATE TABLE oauth_identities (
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
```

### `boards`

```sql
CREATE TABLE boards (
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

CREATE INDEX idx_boards_owner ON boards (owner_id) WHERE NOT is_deleted;
CREATE INDEX idx_boards_share_token ON boards (share_token);
```

### `board_states`

Stores the current Yjs CRDT binary state for each board.

```sql
CREATE TABLE board_states (
  board_id    UUID PRIMARY KEY REFERENCES boards(id) ON DELETE CASCADE,
  crdt_state  BYTEA NOT NULL,          -- Binary Yjs state
  version     BIGINT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `board_snapshots`

Versioned history snapshots of board state.

```sql
CREATE TABLE board_snapshots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id   UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name       TEXT,                      -- Named snapshots (user-created)
  crdt_state BYTEA NOT NULL,
  auto       BOOLEAN NOT NULL DEFAULT true,  -- true = periodic auto-snapshot
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_board_snapshots_board ON board_snapshots (board_id, created_at DESC);
```

### `board_members`

```sql
CREATE TABLE board_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,  -- NULL = link-based
  role        TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'commenter', 'viewer')),
  invited_by  UUID REFERENCES users(id),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (board_id, user_id)
);

CREATE INDEX idx_board_members_user ON board_members (user_id);
CREATE INDEX idx_board_members_board ON board_members (board_id);
```

### `assets`

```sql
CREATE TABLE assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id     UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  uploaded_by  UUID REFERENCES users(id),
  s3_key       TEXT NOT NULL UNIQUE,
  mime_type    TEXT NOT NULL,
  file_size    BIGINT NOT NULL,
  original_name TEXT,
  width        INTEGER,          -- For images
  height       INTEGER,          -- For images
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assets_board ON assets (board_id);
```

### `comments`

```sql
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  object_id   TEXT,              -- Canvas object ID (NULL = canvas-level)
  canvas_x    FLOAT,
  canvas_y    FLOAT,
  resolved    BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comment_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id  UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id),
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_board ON comments (board_id);
```

### `plugins`

```sql
CREATE TABLE plugins (
  id           TEXT PRIMARY KEY,      -- e.g. "com.example.text-to-flowchart"
  name         TEXT NOT NULL,
  version      TEXT NOT NULL,
  manifest     JSONB NOT NULL,
  entry_url    TEXT NOT NULL,
  icon_url     TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `ai_audit_log`

```sql
CREATE TABLE ai_audit_log (
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

CREATE INDEX idx_ai_audit_user ON ai_audit_log (user_id, created_at DESC);
```

---

## JSONB Usage

The `settings` column on `boards` uses JSONB for flexible board configuration that does not need to be queried by individual fields:

```sql
-- Example: query boards with grid enabled
SELECT id, title FROM boards
WHERE settings->>'gridEnabled' = 'true';
```

CRDT state (`board_states.crdt_state`) is stored as `BYTEA` (binary), not JSONB — Yjs state is a binary format, not JSON.

---

## Migrations

Migrations are managed by sqlx-migrate. All migration files are in `crates/api/migrations/`.

```
0001_initial.sql          -- users, boards, board_states, board_members
0002_assets.sql           -- assets table
0003_comments.sql         -- comments, comment_messages
0004_snapshots.sql        -- board_snapshots
0005_plugins.sql          -- plugins registry
0006_ai_audit.sql         -- ai_audit_log
```

See [Database Migrations](../operations/database-migrations.md) for migration workflow.

---

## Related Documents

- [Data Model](data-model.md)
- [Backend Architecture](backend-architecture.md)
- [Database Migrations](../operations/database-migrations.md)
- [ADR-010: Database and Storage](architecture-decisions/ADR-010-database-and-storage.md)
