# Dependency Management

**Status:** Proposed  
**Audience:** Engineers, maintainers  
**Last Reviewed:** 2024-01-15

## Principles

1. **Pin versions** — every dependency is pinned to an exact version in lockfiles
2. **Justify additions** — every new dependency needs a documented reason
3. **Verify licenses** — licenses are checked before adding any dependency
4. **Minimize surface** — fewer dependencies = fewer vulnerabilities and less maintenance

---

## Frontend (Node.js / pnpm)

### Package Manager

Use **pnpm** with a frozen lockfile in CI:
```bash
pnpm install --frozen-lockfile
```

`pnpm-lock.yaml` is committed to the repository. Never commit `node_modules/`.

### Adding a Dependency

Before adding any npm package:
1. Check the license (MIT, Apache-2.0, BSD are acceptable; GPL requires careful evaluation)
2. Check weekly downloads and last publish date (avoid unmaintained packages)
3. Check bundle size impact at [bundlephobia.com](https://bundlephobia.com)
4. Document the reason in the PR description

```bash
pnpm add <package>          # Production dependency
pnpm add -D <package>       # Dev dependency
```

### Approved Core Dependencies (Planned)

| Package | License | Purpose |
|---------|---------|---------|
| react | MIT | UI framework |
| react-dom | MIT | DOM renderer |
| typescript | Apache-2.0 | Type system |
| vite | MIT | Build tool |
| tailwindcss | MIT | Styling |
| @radix-ui/* | MIT | Accessible UI primitives |
| shadcn/ui components | MIT | Pre-built components |
| lucide-react | ISC | Icons |
| zustand | MIT | State management |
| @tanstack/react-query | MIT | Server state |
| konva | MIT | Canvas engine |
| react-konva | MIT | React bindings for Konva |
| yjs | MIT | CRDT collaboration |
| y-websocket | MIT | Yjs WebSocket provider |

### License Scanning

Run license scan in CI:
```bash
pnpm licenses list --prod > licenses.txt
```

Any license not in the approved list (MIT, Apache-2.0, BSD-2, BSD-3, ISC, CC0) triggers a manual review.

---

## Backend (Rust / Cargo)

### Lockfile

`Cargo.lock` is committed for binary crates (applications). This ensures reproducible builds.

### Adding a Crate

```toml
# Cargo.toml — specify exact versions
[dependencies]
axum = "0.7.4"
tokio = { version = "1.35.1", features = ["full"] }
sqlx = { version = "0.7.3", features = ["postgres", "runtime-tokio-native-tls", "uuid", "chrono"] }
```

Prefer exact version pins for production dependencies. Use `cargo update` deliberately, not automatically.

### Key Approved Crates (Planned)

| Crate | License | Purpose |
|-------|---------|---------|
| axum | MIT | Web framework |
| tokio | MIT | Async runtime |
| sqlx | MIT | PostgreSQL client |
| serde / serde_json | MIT/Apache-2.0 | Serialization |
| uuid | Apache-2.0/MIT | UUID generation |
| yrs | MIT | Rust Yjs (CRDT) |
| jsonwebtoken | MIT | JWT handling |
| argon2 | MIT | Password hashing |
| tower | MIT | Middleware |
| tracing | MIT | Logging/tracing |

### Vulnerability Scanning

```bash
cargo audit              # Check for known vulnerabilities
cargo deny check         # Check licenses, bans, advisories
```

Both run in CI on every PR.

---

## Automated Dependency Updates

Use **Dependabot** or **Renovate** to keep dependencies current:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/apps/web"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  - package-ecosystem: "cargo"
    directory: "/apps/api"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

All automated update PRs must pass CI before merging. Security updates are prioritized.

---

## Security Vulnerability Response

When a vulnerability is reported in a dependency:

| Severity | Response Time | Action |
|----------|--------------|--------|
| Critical | 24 hours | Patch or pin to safe version immediately |
| High | 72 hours | Patch and release |
| Medium | 2 weeks | Include in next regular release |
| Low | Next cycle | Monitor and update opportunistically |

---

## Related Documents

- [Coding Standards](./coding-standards.md)
- [Security Engineering](./security.md)
- [Release Process](./release-process.md)
