# Plugin API

**Status:** Proposed  
**Audience:** Plugin developers, platform engineers  
**Last Reviewed:** 2024-01-15

## Overview

The Codrawithm Plugin API is a sandboxed, message-passing interface between plugin code (running in an iframe) and the host platform. Plugins cannot directly manipulate the DOM or access the canvas engine — all interactions go through the API.

---

## Communication Model

Plugins run inside a sandboxed `<iframe>`. Communication uses `postMessage` with a structured protocol:

```
Plugin UI (iframe)  ←──postMessage──→  Platform Host (parent)
                              │
Plugin Worker (Web Worker)  ──┘  (proxied through UI)
```

The platform exposes a JavaScript SDK that wraps the postMessage protocol:

```typescript
// plugin-sdk.d.ts — the API available inside plugin iframes
declare const codrawithm: CodrawithmPluginAPI
```

---

## API Namespaces

### `codrawithm.canvas`

Read and write access to the canvas (requires `canvas:read` / `canvas:write` permissions).

```typescript
interface CanvasAPI {
  // Read operations (canvas:read)
  getSelectedObjects(): Promise<CanvasObject[]>
  getAllObjects(): Promise<CanvasObject[]>
  getObjectById(id: string): Promise<CanvasObject | null>
  getCurrentPage(): Promise<PageInfo>
  getAllPages(): Promise<PageInfo[]>
  getViewport(): Promise<Viewport>

  // Write operations (canvas:write)
  createObject(spec: CreateObjectSpec): Promise<CanvasObject>
  updateObject(id: string, updates: Partial<CanvasObject>): Promise<void>
  deleteObject(id: string): Promise<void>
  createObjects(specs: CreateObjectSpec[]): Promise<CanvasObject[]>  // batch
  moveObject(id: string, x: number, y: number): Promise<void>
  groupObjects(ids: string[]): Promise<string>  // returns group ID
  setViewport(viewport: Partial<Viewport>): Promise<void>

  // Events (canvas:read)
  onSelectionChange(callback: (objects: CanvasObject[]) => void): Unsubscribe
  onObjectCreated(callback: (object: CanvasObject) => void): Unsubscribe
  onObjectUpdated(callback: (object: CanvasObject) => void): Unsubscribe
  onObjectDeleted(callback: (objectId: string) => void): Unsubscribe
  onPageChange(callback: (page: PageInfo) => void): Unsubscribe
}
```

### `codrawithm.ui`

Show plugin UI panels, dialogs, and notifications.

```typescript
interface UIAPI {
  // Show a notification toast
  showNotification(options: {
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    duration?: number  // ms, default 4000
  }): void

  // Open a modal dialog with custom content
  openModal(options: {
    title: string
    width?: number
    height?: number
  }): void
  closeModal(): void

  // Resize the plugin panel
  resizePanel(height: number): void

  // Show a loading indicator over the canvas (blocks interaction)
  showLoading(message?: string): void
  hideLoading(): void
}
```

### `codrawithm.ai`

Request AI operations through the platform's secure backend proxy (requires `ai:request` permission).

```typescript
interface AIAPI {
  // Send a prompt to the configured AI provider
  // Credentials are NEVER exposed to the plugin — the platform proxies the request
  request(options: {
    prompt: string
    systemPrompt?: string
    maxTokens?: number
    temperature?: number
    model?: string  // Provider-specific model name
  }): Promise<AIResponse>

  // Check available quota
  getQuota(): Promise<{ used: number; limit: number; resetsAt: Date }>
}

interface AIResponse {
  content: string
  usage: { promptTokens: number; completionTokens: number; totalTokens: number }
  model: string
}
```

### `codrawithm.storage`

Plugin-scoped persistent storage (requires `storage:plugin` permission).

```typescript
interface StorageAPI {
  // Key-value store scoped to this plugin + board
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
  list(): Promise<string[]>

  // Global plugin storage (across all boards for this user)
  global: {
    get(key: string): Promise<unknown>
    set(key: string, value: unknown): Promise<void>
    delete(key: string): Promise<void>
  }
}
```

### `codrawithm.user`

Read current user information (requires `user:read` permission).

```typescript
interface UserAPI {
  getCurrent(): Promise<{
    id: string
    name: string
    email: string  // Only with user:email permission
    role: 'owner' | 'editor' | 'commenter' | 'viewer'
  }>
}
```

---

## Object Types

### `CanvasObject`

```typescript
interface CanvasObject {
  id: string
  type: 'shape' | 'text' | 'connector' | 'image' | 'frame' | 'group' | 'sticky'
  subtype?: string  // e.g. 'rectangle', 'ellipse', 'arrow'
  x: number
  y: number
  width: number
  height: number
  rotation: number  // degrees
  style: ObjectStyle
  label?: string
  pageId: string
  groupId?: string
  locked: boolean
  zIndex: number
  metadata?: Record<string, unknown>  // Plugin-specific metadata
}

interface ObjectStyle {
  fill?: string         // CSS color or 'none'
  stroke?: string       // CSS color
  strokeWidth?: number
  opacity?: number      // 0-1
  borderRadius?: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  textColor?: string
  textAlign?: 'left' | 'center' | 'right'
}
```

### `CreateObjectSpec`

```typescript
interface CreateObjectSpec {
  type: 'shape' | 'text' | 'connector' | 'sticky'
  subtype?: string
  x: number
  y: number
  width?: number
  height?: number
  style?: Partial<ObjectStyle>
  label?: string
  pageId?: string    // defaults to current page
  metadata?: Record<string, unknown>
}
```

---

## SDK Initialization

```typescript
// In plugin UI (inside iframe)
import { createPluginSDK } from '@codrawithm/plugin-sdk'

const codrawithm = await createPluginSDK()

// SDK is ready — platform has confirmed the plugin is authorized
codrawithm.ui.showNotification({ message: 'Plugin loaded!', type: 'info' })

const selected = await codrawithm.canvas.getSelectedObjects()
console.log(`${selected.length} objects selected`)
```

---

## Error Handling

All API calls return Promises and reject with structured errors:

```typescript
interface PluginAPIError {
  code: string    // e.g. 'PERMISSION_DENIED', 'OBJECT_NOT_FOUND', 'QUOTA_EXCEEDED'
  message: string
  details?: unknown
}
```

Common error codes:

| Code | Meaning |
|------|---------|
| `PERMISSION_DENIED` | Plugin doesn't have the required permission |
| `OBJECT_NOT_FOUND` | Referenced object ID doesn't exist |
| `QUOTA_EXCEEDED` | AI or storage quota exceeded |
| `INVALID_SPEC` | CreateObjectSpec validation failed |
| `NETWORK_ERROR` | AI proxy request failed |
| `TIMEOUT` | Operation took too long |

---

## Related Documents

- [Plugin Manifest](./plugin-manifest.md)
- [Plugin Permissions](./plugin-permissions.md)
- [Plugin Security](./plugin-security.md)
- [AI Provider Interface](./ai-provider-interface.md)
- [Example Plugin Spec](./example-plugin-spec.md)
