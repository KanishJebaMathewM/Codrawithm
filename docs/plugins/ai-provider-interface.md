# AI Provider Interface

**Status:** Proposed  
**Audience:** Plugin developers, backend engineers  
**Last Reviewed:** 2024-01-15

## Overview

AI provider integrations in Codrawithm follow a strict separation of concerns: **plugins never hold API credentials**. All AI requests from plugins are proxied through the Codrawithm backend, which holds provider credentials securely and enforces quotas.

---

## Architecture

```
Plugin (iframe)
    │
    │  codrawithm.ai.request({ prompt: "..." })
    │
    ▼
Platform API Bridge (postMessage)
    │
    │  Validated, quota-checked, logged
    │
    ▼
Codrawithm Backend (Rust/Axum)
    │
    │  Provider-specific request format
    │  API key from server environment / secrets store
    │
    ▼
AI Provider API (OpenAI / Anthropic / etc.)
    │
    ▼
Response returned up the chain
Plugin receives text response only
```

API keys are **never** sent to the browser. Plugins receive only the text response.

---

## Plugin-Side Usage

```typescript
// Plugin requests AI completion via the SDK
const response = await codrawithm.ai.request({
  prompt: "Generate a flowchart for a user authentication process",
  systemPrompt: "You are a diagram expert. Respond only with JSON in the specified format.",
  maxTokens: 1000,
  temperature: 0.7
})

// response.content is the raw text from the AI provider
const diagramSpec = JSON.parse(response.content)
```

---

## Backend Proxy API

The backend exposes an internal AI proxy endpoint (not directly accessible from browsers without auth):

### `POST /api/v1/ai/complete`

**Request:**
```json
{
  "pluginId": "com.example.text-to-flowchart",
  "boardId": "board_01HN...",
  "request": {
    "prompt": "Generate a flowchart...",
    "systemPrompt": "You are a diagram expert...",
    "maxTokens": 1000,
    "temperature": 0.7,
    "model": null
  }
}
```

**Response (success):**
```json
{
  "content": "...",
  "usage": {
    "promptTokens": 45,
    "completionTokens": 312,
    "totalTokens": 357
  },
  "model": "gpt-4o-mini",
  "provider": "openai"
}
```

**Response (quota exceeded):**
```json
{
  "error": "QUOTA_EXCEEDED",
  "message": "Monthly AI quota of 100,000 tokens exceeded",
  "quota": { "used": 100000, "limit": 100000, "resetsAt": "2024-02-01T00:00:00Z" }
}
```

---

## Provider Abstraction

The backend implements a provider abstraction layer so multiple AI providers can be supported without changing the plugin API:

```rust
// Simplified Rust trait for AI provider abstraction
#[async_trait]
pub trait AiProvider: Send + Sync {
    fn name(&self) -> &str;
    async fn complete(&self, request: AiRequest) -> Result<AiResponse, AiError>;
    async fn check_quota(&self, user_id: Uuid) -> Result<QuotaInfo, AiError>;
}

pub struct OpenAiProvider { api_key: String, client: reqwest::Client }
pub struct AnthropicProvider { api_key: String, client: reqwest::Client }
```

### Supported Providers (Planned)

| Provider | Status | Notes |
|----------|--------|-------|
| OpenAI (GPT-4o, GPT-4o-mini) | Planned Phase 4 | Primary provider |
| Anthropic (Claude 3.x) | Planned Phase 4 | Secondary provider |
| Google (Gemini) | Future | Under investigation |
| Local/self-hosted (Ollama) | Future | For self-hosting support |

---

## Provider Configuration

Providers are configured via environment variables on the backend server, never in client-side code:

```bash
# .env (server only, never shipped to browser)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=ant-...
AI_DEFAULT_PROVIDER=openai
AI_FALLBACK_PROVIDER=anthropic
```

User-level provider configuration (future): Users with their own API keys can register them via Settings → AI → Bring Your Own Key. Keys are stored encrypted server-side, never in browser storage.

---

## Quota System

### Per-User Quotas

| Plan | Monthly Token Quota | Notes |
|------|--------------------|----|
| Free | 10,000 tokens | Shared across all plugins |
| Pro (planned) | 100,000 tokens | Shared across all plugins |
| BYOK (bring your own key) | Unlimited | Billed to user's own API account |

### Enforcement

1. Before forwarding to AI provider, backend checks remaining quota
2. If quota exceeded, returns `QUOTA_EXCEEDED` error immediately
3. Token usage is tracked per-request in the `ai_usage` database table
4. Monthly quota resets on billing cycle date

---

## Content Policy

The backend applies content filtering before forwarding to AI providers:

1. **PII detection:** Warns if prompt appears to contain email addresses, phone numbers, or API keys
2. **Size limits:** Prompts truncated to 8,000 tokens maximum
3. **Rate limiting:** Max 10 AI requests per minute per user (burst), 100 per hour sustained
4. **Audit logging:** All AI requests logged with plugin ID, user ID (not content) for abuse detection

---

## AI-Generated Output Validation

Plugins are responsible for validating AI output before inserting it to the canvas. The platform does not validate plugin output — this is intentional (plugins know their own expected output format).

**Best practice for plugins:**

```typescript
const response = await codrawithm.ai.request({ prompt })

let parsed
try {
  parsed = JSON.parse(response.content)
} catch {
  codrawithm.ui.showNotification({
    message: 'AI returned unexpected output. Try rephrasing your prompt.',
    type: 'error'
  })
  return
}

// Validate the structure before inserting to canvas
if (!isValidDiagramSpec(parsed)) {
  // Show error to user
  return
}

// Insert to canvas
await codrawithm.canvas.createObjects(parsed.objects)
```

---

## Related Documents

- [Plugin API](./plugin-api.md)
- [Plugin Security](./plugin-security.md)
- [AI Integration Architecture](../architecture/ai-integration.md)
- [Plugin Permissions](./plugin-permissions.md)
- [Example Plugin Spec](./example-plugin-spec.md)
