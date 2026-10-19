# AI Integration Architecture

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm integrates AI capabilities via a **backend-proxy pattern**. The frontend never communicates directly with AI providers — all AI requests are routed through the Codrawithm backend, which adds credentials and enforces rate limits.

See [ADR-011](architecture-decisions/ADR-011-ai-provider-integration.md).

---

## Security Boundary

```
Browser (React App)
        │
        │  POST /api/v1/ai/generate
        │  { prompt, mode, context }
        │  (no API key)
        ▼
Codrawithm Backend (Rust)
        │
        │  POST https://api.openai.com/v1/chat/completions
        │  Authorization: Bearer sk-... (from env var, never sent to browser)
        ▼
AI Provider (OpenAI / Anthropic / Ollama)
```

**Why backend proxy?**
- API keys are never exposed in browser network requests, DevTools, or source maps.
- Rate limiting is enforced server-side — users cannot bypass it by calling the AI provider directly.
- The backend can audit all AI requests.
- Provider switching (e.g., from OpenAI to Anthropic) does not require frontend changes.

---

## Provider Abstraction

The backend defines a `AiProvider` trait:

```rust
#[async_trait]
pub trait AiProvider: Send + Sync {
    async fn generate(
        &self,
        request: AiGenerateRequest,
    ) -> Result<AiGenerateResponse, AppError>;
}

pub struct AiGenerateRequest {
    pub prompt: String,
    pub mode: AiMode,           // Generate | Explain | Transform
    pub context: Option<String>, // Serialized selected objects (for Explain mode)
    pub output_format: OutputFormat, // Flowchart | Diagram | Text
}

pub struct AiGenerateResponse {
    pub objects: Vec<CanvasObjectSpec>, // Objects to place on canvas
    pub explanation: Option<String>,    // For Explain mode
    pub tokens_used: Option<u32>,
}
```

Concrete implementations:

```rust
pub struct OpenAiProvider { client: reqwest::Client, api_key: String, model: String }
pub struct AnthropicProvider { client: reqwest::Client, api_key: String, model: String }
pub struct OllamaProvider { client: reqwest::Client, base_url: String, model: String }
```

The active provider is configured via environment variables:

```bash
AI_PROVIDER=openai          # openai | anthropic | ollama | none
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
# Or:
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

---

## Response Parsing

AI providers return natural language text or structured JSON (when prompted with a schema). The backend parses the response into `CanvasObjectSpec` values.

For diagram generation, the backend sends a system prompt instructing the model to return a specific JSON schema:

```json
{
  "objects": [
    { "type": "rectangle", "label": "API Server", "x": 100, "y": 100, "width": 150, "height": 60 },
    { "type": "rectangle", "label": "Database", "x": 100, "y": 250, "width": 150, "height": 60 },
    { "type": "arrow", "from": "API Server", "to": "Database", "label": "SQL" }
  ]
}
```

If the model returns invalid JSON or an unexpected schema, the backend returns a 422 error with a descriptive message. The frontend shows this as a "Generation failed — try a clearer description" toast.

---

## Rate Limiting

Per-user rate limits prevent runaway AI costs:

```rust
pub struct RateLimiter {
    redis: RedisPool,
}

impl RateLimiter {
    pub async fn check_and_increment(
        &self,
        user_id: Uuid,
        tier: UserTier,
    ) -> Result<(), AppError> {
        let key = format!("ai_rate:{}:{}", user_id, current_minute());
        let count: u64 = self.redis.incr(&key).await?;
        self.redis.expire(&key, 60).await?;

        let limit = match tier {
            UserTier::Free => 5,
            UserTier::Pro => 30,
        };

        if count > limit {
            Err(AppError::RateLimitExceeded)
        } else {
            Ok(())
        }
    }
}
```

---

## No-Provider Mode

When no AI provider is configured (`AI_PROVIDER=none`), the `/api/v1/ai/generate` endpoint returns 503 with:

```json
{ "error": "AI features are not configured on this instance. See the deployment docs to set up an AI provider." }
```

The frontend detects this response and disables AI features in the UI (grays out AI Studio, removes AI toolbar button).

---

## Audit Logging

All AI requests are logged:

```rust
struct AiAuditLog {
    user_id: Uuid,
    board_id: Option<Uuid>,
    provider: String,
    mode: String,
    prompt_chars: usize,        // Not the full prompt — just length
    response_objects: usize,    // How many objects were generated
    tokens_used: Option<u32>,
    outcome: String,            // "accepted" | "regenerated" | "discarded" | "error"
    created_at: DateTime<Utc>,
}
```

Logs are stored in PostgreSQL and retained for 30 days (configurable).

---

## Related Documents

- [AI Studio (Product)](../product/ai-studio.md)
- [AI Provider Interface (Plugin)](../plugins/ai-provider-interface.md)
- [ADR-011: AI Provider Integration](architecture-decisions/ADR-011-ai-provider-integration.md)
- [Security](../engineering/security.md)
