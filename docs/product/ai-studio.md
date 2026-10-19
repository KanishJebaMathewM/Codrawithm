# AI Studio

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

The AI Studio is Codrawithm's framework for integrating AI capabilities into the canvas workspace. Rather than hardcoding a single AI provider, the system exposes a plugin slot that any AI provider can implement — OpenAI, Anthropic, Ollama, or a custom local model.

AI features are assistance tools. They produce editable canvas objects. They never execute directly on the canvas without user review.

**Important:** No AI provider API keys are stored in the browser or transmitted from the frontend. All AI requests are proxied through the Codrawithm backend. See [AI Integration architecture](../architecture/ai-integration.md) and [AI Provider Interface](../plugins/ai-provider-interface.md) for implementation details.

---

## AI Feature Categories

### Category 1: Generation

AI generates canvas content from a text description.

**Text-to-Diagram (P1)**
- User types a description of a system or process.
- AI returns a structured diagram representation.
- Codrawithm places the result as editable canvas objects.
- User reviews, adjusts, and accepts or discards.

Example prompt: *"A web application with a React frontend, a Node.js API server, a PostgreSQL database, and a Redis cache, all behind an nginx load balancer."*

Expected output: 5 shape objects (frontend, API, DB, cache, LB) with labeled arrows connecting them.

**Text-to-Flowchart (P1)**
- User describes a process in natural language.
- AI returns a flowchart structure (nodes with types: start, process, decision, end).
- Codrawithm renders the flowchart using the flowchart workspace tools.

Example prompt: *"User submits a login form. Check if email exists. If not, show error. If yes, check password. If wrong, show error. If correct, generate JWT and redirect to dashboard."*

**Text-to-Algorithm Visualization (P2)**
- User describes an algorithm in pseudocode or prose.
- AI produces the algorithm step sequence that the visualization engine can play back.
- Limited to supported algorithm types in Phase 1.

### Category 2: Explanation

AI explains what is already on the canvas.

**Diagram Explanation (P2)**
- User selects one or more canvas objects.
- Right-click → "Explain with AI."
- AI provides a natural language explanation of the selected content.
- Displayed in a side panel; not added to the canvas.

**Algorithm Step Explanation (P2)**
- During algorithm visualization, user clicks "Explain this step."
- AI explains what is happening at the current step in plain language.
- Useful when the auto-generated step description is not sufficient.

### Category 3: Transformation

AI transforms existing canvas content.

**Summarize to Sticky Note (P3)**
- User selects a dense architecture diagram.
- AI generates a short summary as sticky notes.

**Suggest Missing Components (P3)**
- User selects an architecture diagram.
- AI reviews and suggests potentially missing components (e.g., "I don't see a cache layer between your API and database").

---

## AI Studio Workspace

The AI Studio workspace type provides a dedicated environment for AI-assisted content creation.

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Provider: GPT-4o ▼]  [Mode: Generate ▼]  [Clear]  [History ▼]   │
├─────────────────────────┬───────────────────────────────────────────┤
│                         │                                            │
│   Canvas (editable      │   AI Prompt Panel                         │
│   result area)          │                                            │
│                         │   Describe what you want to create:       │
│                         │   ┌────────────────────────────────────┐  │
│                         │   │                                    │  │
│                         │   │                                    │  │
│                         │   └────────────────────────────────────┘  │
│                         │   [Generate]                              │
│                         │                                            │
│                         │   Result Preview:                         │
│                         │   [Accept] [Regenerate] [Discard]        │
└─────────────────────────┴───────────────────────────────────────────┘
```

### Workflow

1. User selects an AI provider plugin (or the default if one is configured).
2. User selects a mode (Generate, Explain, Transform).
3. User types a prompt in the AI Prompt Panel.
4. Codrawithm sends the request to the backend, which proxies it to the AI provider.
5. The AI response is parsed and rendered in the Result Preview.
6. User clicks **Accept** to place the result on the canvas as editable objects, **Regenerate** to try again, or **Discard** to clear.

---

## AI Provider Plugin Slot

Any AI provider is plugged in via the plugin system. Codrawithm ships with no built-in provider — users must install a provider plugin.

**Available provider options (community-provided plugins):**
- `codrawithm-plugin-openai` — OpenAI GPT-4o / GPT-4 via user-configured API key (stored server-side, never in browser).
- `codrawithm-plugin-anthropic` — Anthropic Claude.
- `codrawithm-plugin-ollama` — Local Ollama LLM endpoint.
- `codrawithm-plugin-openai-compatible` — Any OpenAI-compatible API (e.g., LM Studio, Jan, Together AI).

See [AI Provider Interface](../plugins/ai-provider-interface.md) for the plugin contract.

---

## Security Constraints

| Constraint | Rationale |
|-----------|-----------|
| API keys stored server-side only, never sent to browser | Prevents key leakage via browser devtools or XSS |
| All AI requests routed through backend proxy | Backend validates, rate-limits, and audits AI calls |
| AI-generated canvas objects are inert (no JS execution) | Prevents prompt-injection attacks from generating executable content |
| AI result preview before acceptance | User retains full control; no auto-placement |
| Plugin sandbox applies to AI providers | AI provider plugins run in the iframe sandbox with limited permissions |

---

## Rate Limiting

The backend applies per-user rate limits on AI requests regardless of which provider plugin is used:

| Tier | Requests per minute | Requests per day |
|------|--------------------|--------------------|
| Free | 5 | 50 |
| Pro | 30 | 500 |
| Self-hosted | Configurable | Configurable |

Rate limit headers are returned in AI API responses for observability.

---

## AI Audit Log

All AI requests and responses are logged in the backend audit log with:
- User ID
- Timestamp
- Provider used
- Prompt (truncated to 1000 chars)
- Response length
- Tokens used (if provider reports it)
- Accept / Regenerate / Discard outcome

Logs are retained for 30 days by default (configurable for self-hosted).

---

## Related Documents

- [AI Integration Architecture](../architecture/ai-integration.md)
- [AI Provider Interface](../plugins/ai-provider-interface.md)
- [Plugin System](../architecture/plugin-system.md)
- [Security](../engineering/security.md)
- [Feature Catalog — AI](../vision/feature-catalog.md#ai-studio-ai)
