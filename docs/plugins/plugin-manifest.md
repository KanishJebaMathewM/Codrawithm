# Plugin Manifest

**Status:** Proposed  
**Audience:** Plugin developers, platform engineers  
**Last Reviewed:** 2024-01-15

## Overview

Every Codrawithm plugin must include a `manifest.json` file at the root of the plugin package. The manifest declares the plugin's identity, permissions, capabilities, and entry points. The platform validates this manifest before installation.

---

## Manifest Schema

```json
{
  "$schema": "https://codrawithm.dev/schemas/plugin-manifest/v1.json",
  "manifestVersion": 1,
  "id": "com.example.text-to-flowchart",
  "name": "Text to Flowchart",
  "version": "1.2.0",
  "description": "Generate flowcharts from natural language descriptions using AI.",
  "longDescription": "Describe a process in plain text and get an editable flowchart on your board. Supports OpenAI and Anthropic providers.",
  "author": {
    "name": "Example Developer",
    "email": "dev@example.com",
    "url": "https://example.com"
  },
  "license": "MIT",
  "homepage": "https://example.com/text-to-flowchart",
  "repository": "https://github.com/example/text-to-flowchart-plugin",
  "icon": "assets/icon.png",
  "screenshots": [
    "assets/screenshot-1.png",
    "assets/screenshot-2.png"
  ],
  "keywords": ["flowchart", "ai", "diagram", "automation"],
  "categories": ["AI", "Diagrams"],
  "minPlatformVersion": "0.5.0",
  "maxPlatformVersion": null,
  "entryPoints": {
    "ui": "dist/ui.html",
    "worker": "dist/worker.js"
  },
  "permissions": [
    "canvas:read",
    "canvas:write",
    "ai:request",
    "storage:plugin"
  ],
  "workspaceTypes": ["whiteboard", "flowchart", "all"],
  "contributes": {
    "toolbarItems": [
      {
        "id": "generate-flowchart",
        "label": "Generate Flowchart",
        "icon": "assets/toolbar-icon.svg",
        "tooltip": "Generate a flowchart from text using AI",
        "position": "sidebar"
      }
    ],
    "contextMenuItems": [
      {
        "id": "explain-selection",
        "label": "Explain with AI",
        "when": "selectionCount > 0"
      }
    ],
    "commands": [
      {
        "id": "text-to-flowchart.generate",
        "label": "Text to Flowchart: Generate",
        "shortcut": "Ctrl+Shift+G"
      }
    ],
    "panels": [
      {
        "id": "text-to-flowchart-panel",
        "title": "AI Flowchart",
        "icon": "assets/panel-icon.svg",
        "defaultLocation": "right"
      }
    ]
  },
  "configuration": {
    "properties": {
      "defaultProvider": {
        "type": "string",
        "default": "openai",
        "enum": ["openai", "anthropic"],
        "description": "Default AI provider to use"
      },
      "autoInsert": {
        "type": "boolean",
        "default": false,
        "description": "Automatically insert generated diagram without preview"
      }
    }
  },
  "funding": {
    "type": "patreon",
    "url": "https://patreon.com/example"
  }
}
```

---

## Field Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `manifestVersion` | integer | Always `1` for this version of the spec |
| `id` | string | Reverse-domain unique identifier (e.g. `com.example.plugin-name`) |
| `name` | string | Display name (max 64 chars) |
| `version` | string | Semantic version string (e.g. `1.2.0`) |
| `description` | string | Short description (max 160 chars) |
| `author` | object | Author name (required), email and url (optional) |
| `license` | string | SPDX license identifier (e.g. `MIT`, `Apache-2.0`) |
| `entryPoints.ui` | string | Path to the UI HTML file (loaded in sandboxed iframe) |
| `permissions` | array | List of permission strings the plugin requires |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `longDescription` | string | Markdown-formatted longer description |
| `icon` | string | Path to 256×256px PNG icon |
| `screenshots` | array | Paths to screenshots for plugin marketplace |
| `keywords` | array | Searchable tags |
| `categories` | array | Plugin category for marketplace filtering |
| `minPlatformVersion` | string | Minimum Codrawithm version required |
| `maxPlatformVersion` | string | Maximum compatible version (null = no upper limit) |
| `entryPoints.worker` | string | Path to Web Worker JS for background processing |
| `workspaceTypes` | array | Which workspace types this plugin applies to |
| `contributes` | object | UI contribution points (toolbar, menu, commands, panels) |
| `configuration` | object | User-configurable settings schema |
| `funding` | object | Optional funding link for plugin author |
| `repository` | string | Source code URL |
| `homepage` | string | Plugin documentation URL |

---

## Plugin ID Conventions

- Use reverse domain notation: `com.yourname.plugin-name`
- All lowercase, hyphens allowed, no spaces
- Must be globally unique in the plugin registry
- Cannot start with `com.codrawithm` (reserved)

---

## Version Policy

- Plugins use semantic versioning (`MAJOR.MINOR.PATCH`)
- Breaking changes to the plugin API contract require a `MAJOR` version bump
- The platform may show compatibility warnings for outdated plugins

---

## Manifest Validation

The platform validates manifests on installation:

1. JSON schema validation against the published schema
2. Permission list validation (all permissions must be known)
3. Entry point file existence check
4. ID uniqueness check (against installed plugins)
5. Platform version compatibility check

Validation errors are shown to the user before installation proceeds.

---

## Related Documents

- [Plugin API](./plugin-api.md)
- [Plugin Permissions](./plugin-permissions.md)
- [Plugin Lifecycle](./plugin-lifecycle.md)
- [Plugin Security](./plugin-security.md)
- [Example Plugin Spec](./example-plugin-spec.md)
