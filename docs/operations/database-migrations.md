# Database Migrations

**Status:** Proposed  
**Audience:** Backend engineers  
**Last Reviewed:** 2024-01-15

## Overview

Codrawithm uses [sqlx](https://github.com/launchbadge/sqlx) (MIT license) for database access and its built-in migration system for schema management. Migrations are version-controlled, run in order, and never modified after being applied.

---

## Migration Tool: sqlx-cli

Install:
```bash
cargo install sqlx-cli --no-default-features --features native-tls,postgres
```

Common commands:
```bash
sqlx migrate run          # Apply pending migrations
sqlx migrate revert       # Revert the last migration
sqlx migrate info         # Show migration status
sqlx migrate add <name>   # Create a new migration file
```

---

## Migration File Naming

```
migrations/
├── 0001_initial_schema.sql
├── 0002_add_board_pages.sql
├── 0003_add_collaboration_sessions.sql
├── 0004_add_plugin_installations.sql
└── ...
```

Format: `{sequential_number}_{descriptive_name}.sql`

Rules:
- Sequential integers, zero-padded to 4 digits
- Descriptive snake_case names
- Never rename or delete a migration file after it has been applied to any environment
- Never modify a migration file after it has been applied

---

## Initial Schema (Planned)

```sql
-- 0001_initial_schema.sql

-- Users
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workspaces (organizations / personal)
CREATE TABLE workspaces (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    owner_id    UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Boards
CREATE TABLE boards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title           TEXT NOT NULL DEFAULT 'Untitled Board',
    workspace_type  TEXT NOT NULL DEFAULT 'whiteboard',
    created_by      UUID NOT NULL REFERENCES users(id),
    is_deleted      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Board membership and permissions
CREATE TABLE board_members (
    board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'commenter', 'viewer')),
    invited_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (board_id, user_id)
);

-- Board share links
CREATE TABLE board_share_links (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    access_role TEXT NOT NULL CHECK (access_role IN ('editor', 'commenter', 'viewer')),
    require_auth BOOLEAN NOT NULL DEFAULT false,
    expires_at  TIMESTAMPTZ,
    created_by  UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Yjs document state (current snapshot)
CREATE TABLE board_documents (
    board_id    UUID PRIMARY KEY REFERENCES boards(id) ON DELETE CASCADE,
    ydoc_state  BYTEA NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Yjs incremental updates (for history)
CREATE TABLE board_updates (
    id          BIGSERIAL PRIMARY KEY,
    board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    update_data BYTEA NOT NULL,
    client_id   UUID,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_board_updates_board_created ON board_updates(board_id, created_at DESC);

-- Assets (images, files)
CREATE TABLE assets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id    UUID REFERENCES boards(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    filename    TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes  BIGINT NOT NULL,
    storage_key TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_boards_workspace ON boards(workspace_id);
CREATE INDEX idx_boards_created_by ON boards(created_by);
CREATE INDEX idx_board_members_user ON board_members(user_id);
CREATE INDEX idx_assets_board ON assets(board_id);
```

---

## Migration Best Practices

### DO
- Make migrations idempotent where possible (`CREATE TABLE IF NOT EXISTS`)
- Add indexes in separate migration steps for large tables
- Use transactions for data migrations
- Test both `migrate run` and `migrate revert` in development before committing

### DON'T
- Drop columns without a deprecation period (use soft delete first)
- Rename columns in a single migration (add new → backfill → drop old = 3 migrations)
- Add `NOT NULL` columns without defaults to existing tables
- Run long-running data migrations during deployment (do offline or in background jobs)

---

## Zero-Downtime Migrations

For tables that see heavy traffic, follow the expand-contract pattern:

**Step 1 (Expand):** Add new column with default, keep old column
```sql
ALTER TABLE boards ADD COLUMN new_field TEXT NOT NULL DEFAULT '';
```

**Step 2 (Backfill):** Background job fills the new column from old data

**Step 3 (Contract):** Once all rows are backfilled, drop old column
```sql
ALTER TABLE boards DROP COLUMN old_field;
```

Each step is a separate migration and deployment.

---

## Rollback Strategy

`sqlx migrate revert` rolls back the last migration. Each migration file should have a corresponding `down` section if using the reversible migration format, or a separate `{name}.down.sql` file.

For production rollbacks:
1. Deploy previous application version first
2. Run `sqlx migrate revert` to roll back the schema
3. Verify application health

Some migrations (e.g. dropping a column) are difficult to reverse. Document non-reversible migrations explicitly.

---

## Related Documents

- [Local Development](./local-development.md)
- [Database Design](../architecture/database-design.md)
- [Deployment](./deployment.md)
- [Backups and Recovery](./backups-and-recovery.md)
