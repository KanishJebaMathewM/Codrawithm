# Permissions

**Status:** Proposed  
**Audience:** Backend engineers, product team  
**Last Reviewed:** 2024-01-15

## Overview

Codrawithm uses a role-based permission model for boards. Permissions control what actions a user can perform on a board and are enforced at both the API layer and the WebSocket synchronization layer.

---

## Board Roles

| Role | Description |
|------|-------------|
| **Owner** | Full control. Created the board. Can delete the board, manage members, change roles. |
| **Editor** | Can view and edit all content. Can invite others up to Editor level. Cannot delete board or change Owner. |
| **Commenter** | Can view and add comments. Cannot modify canvas objects. |
| **Viewer** | Read-only access. Can view and export (if allowed). Cannot comment or edit. |

### Role Hierarchy

```
Owner > Editor > Commenter > Viewer
```

A user can only grant roles up to their own level (Editors cannot grant Owner role).

---

## Permission Matrix

| Action | Owner | Editor | Commenter | Viewer |
|--------|-------|--------|-----------|--------|
| View board | ✅ | ✅ | ✅ | ✅ |
| Export board | ✅ | ✅ | ✅ | ✅ |
| Add comments | ✅ | ✅ | ✅ | ❌ |
| Reply to comments | ✅ | ✅ | ✅ | ❌ |
| Create objects | ✅ | ✅ | ❌ | ❌ |
| Edit objects | ✅ | ✅ | ❌ | ❌ |
| Delete objects | ✅ | ✅ | ❌ | ❌ |
| Move objects | ✅ | ✅ | ❌ | ❌ |
| Upload assets | ✅ | ✅ | ❌ | ❌ |
| Rename board | ✅ | ✅ | ❌ | ❌ |
| Invite members | ✅ | ✅ | ❌ | ❌ |
| Change member roles | ✅ | ✅* | ❌ | ❌ |
| Remove members | ✅ | ✅* | ❌ | ❌ |
| Enable/disable share link | ✅ | ✅ | ❌ | ❌ |
| View version history | ✅ | ✅ | ✅ | ✅ |
| Restore version | ✅ | ✅ | ❌ | ❌ |
| Delete board | ✅ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |
| Manage plugins on board | ✅ | ✅ | ❌ | ❌ |

*Editors can only manage roles up to Editor level (cannot promote to Owner or demote Owner).

---

## Share Links

Boards can be shared via a link with a configurable access level:

| Link Type | Access Granted |
|-----------|---------------|
| View-only link | Viewer access to anyone with the link |
| Comment link | Commenter access to anyone with the link |
| Edit link | Editor access to anyone with the link (use carefully) |
| No link | Board is private (named members only) |

Share links:
- Generate a signed token stored in the database
- Can be revoked instantly (token invalidated)
- Can optionally require sign-in even with a link
- Expire after 90 days by default (configurable)
- Each board has one active link per access level at a time

---

## Permission Enforcement

### API Layer

Every REST API endpoint and WebSocket message is validated against the user's role:

```rust
// Example middleware in Axum
async fn require_editor(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(board_id): Path<Uuid>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let role = state.db.get_board_role(board_id, auth.user_id).await?;
    if role < Role::Editor {
        return Err(AppError::Forbidden("Editor role required"));
    }
    Ok(next.run(request).await)
}
```

### WebSocket Layer

When a client connects to the WebSocket:
1. Token is validated (authentication)
2. Board membership is checked (authorization)
3. Role is attached to the connection context
4. Incoming Yjs updates are validated against the role before being applied

A Viewer or Commenter connection will have updates rejected server-side even if the client sends them (defense in depth).

### Frontend Layer

The UI reflects permissions:
- Edit tools are hidden for Commenters and Viewers
- Toolbar shows read-only indicators
- Attempting an edit action that's not permitted shows an inline message: "You have view-only access. Request edit access from the board owner."

---

## Workspace-Level Permissions (Future)

When workspace organizations are introduced (Phase 4+):

- Users belong to a workspace (org)
- Workspace admins can set default board access for org members
- Boards can be set to "org-visible" (any org member can find and view)
- Individual board roles override workspace defaults

---

## Permission Change Propagation

When a user's role is changed while they are connected to a board:
1. Server sends an `auth` WebSocket message to the affected client
2. Client receives the update and adjusts UI accordingly
3. If access is revoked entirely, the WebSocket connection is closed with code 4003 (Forbidden)

---

## Related Documents

- [Sync Protocol](./sync-protocol.md)
- [Collaboration](../product/collaboration.md)
- [Authentication and Authorization](../architecture/authentication-and-authorization.md)
- [API Design](../architecture/api-design.md)
