# Security Policy

This document describes how to report security vulnerabilities in Codrawithm, how the maintainers will respond, and what the project's security posture looks like at this stage of development.

---

## Supported Versions

Codrawithm has not yet released a production version. There is no runnable application at this time.

| Version | Status | Security Support |
|---------|--------|-----------------|
| Any production release | Not yet available | — |
| Pre-release / development | No public builds | Not applicable |

Once the project publishes its first release, this table will be updated to reflect which versions receive security fixes. As a general principle, only the most recent stable release will receive security patches unless a vulnerability is severe enough to warrant backporting.

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue to report a security vulnerability.** Public issues are visible to everyone immediately, which could expose users to risk before a fix is available.

Instead, use one of the following private channels:

### Option 1: GitHub Private Security Advisory (preferred)

GitHub provides a built-in mechanism for reporting security vulnerabilities privately. To use it:

1. Go to the [Codrawithm repository](https://github.com/KanishJebaMathewM/Codrawithm) on GitHub.
2. Click the **Security** tab.
3. Click **Report a vulnerability**.
4. Fill in the form with as much detail as possible.

This creates a private advisory that only you and the maintainers can see. It allows for a coordinated response before any public disclosure.

### Option 2: Contact maintainers directly

If you are unable to use GitHub's private security advisory feature, contact the repository maintainers through their GitHub profiles. You can find the current maintainers listed in the repository.

### What to include in your report

A useful vulnerability report includes:

- A clear description of the vulnerability and the potential impact.
- The component or area of the codebase affected (if known).
- Step-by-step instructions to reproduce the issue.
- Any proof-of-concept code, screenshots, or recordings (if applicable).
- Your assessment of severity (critical, high, medium, low).
- Any suggested mitigations or fixes, if you have them.

The more detail you provide, the faster the maintainers can assess and address the issue.

---

## Response Timeline

The maintainers are committed to responding to security reports in a timely and transparent manner.

| Stage | Target timeline |
|-------|----------------|
| Initial acknowledgement | Within 48 hours of receiving the report |
| Triage and severity assessment | Within 7 days |
| Status update to reporter | Every 7 days until resolved |
| Fix and coordinated disclosure | Dependent on severity and complexity |

**Severity-based response targets:**

- **Critical** (active exploitation or severe data exposure): fix targeted within 7 days; disclosure coordinated immediately after.
- **High** (significant but not actively exploited): fix targeted within 14 days.
- **Medium** (limited scope or requires significant user interaction): fix targeted within 30 days.
- **Low** (minimal risk, hardening improvement): addressed in the next regular release cycle.

These timelines are goals, not guarantees. Complex vulnerabilities or ones requiring architectural changes may take longer. The maintainers will communicate any delays to the reporter.

---

## Disclosure Policy

Codrawithm follows a **coordinated disclosure** model:

1. The reporter submits a private report.
2. The maintainers acknowledge receipt and begin triage.
3. A fix is developed and tested privately.
4. The reporter is given advance notice before the fix is released.
5. The fix is released and a public security advisory is published simultaneously.
6. Credit is given to the reporter in the advisory (unless they prefer to remain anonymous).

The default embargo period — the time between a fix being ready and public disclosure — is **14 days** from the time a patch is available. This gives downstream users and deployers time to update before the vulnerability details are public. The embargo may be shortened if a vulnerability is already being actively exploited in the wild.

Please do not publicly disclose a vulnerability before the coordinated disclosure date. The maintainers will work with reporters to find a mutually agreed timeline.

---

## Security Scope

### In scope

The following classes of vulnerabilities are considered in scope for security reports:

- **Cross-site scripting (XSS):** Any vector that allows an attacker to inject and execute scripts in the context of another user's session.
- **Authentication and authorization bypass:** Anything that allows access to resources or actions without proper credentials or permissions.
- **Data exposure:** Unintended disclosure of user data, board contents, or session information to unauthorized parties.
- **Plugin or extension sandbox escape:** Any mechanism that allows a plugin or user-provided content to break out of its intended execution boundary and access host-level resources.
- **Cross-site request forgery (CSRF):** Requests that cause state changes without the user's knowledge or intent.
- **Insecure direct object references:** Accessing another user's data by manipulating identifiers.
- **Server-side request forgery (SSRF):** Forcing the server to make unintended requests to internal or external systems.
- **Injection vulnerabilities:** SQL injection, command injection, or similar attacks if a backend is introduced.
- **Denial of service via resource exhaustion:** Inputs that can crash the application or cause severe performance degradation for other users.

### Out of scope

The following are generally considered out of scope:

- Social engineering attacks targeting maintainers or contributors (e.g., phishing for credentials).
- Physical attacks against infrastructure.
- Attacks that require physical access to a user's device.
- Theoretical vulnerabilities without a practical exploit or demonstrated impact.
- Vulnerabilities in third-party services that Codrawithm depends on (report those to the relevant third party).
- Automated scanner output without manual verification that the finding is a real vulnerability.
- Issues in browsers or operating systems that are not within the project's control.
- Rate limiting and brute-force protections on publicly accessible, unauthenticated endpoints (unless the rate limits are absurdly low).

If you are unsure whether an issue is in scope, report it privately anyway. The worst outcome is that the maintainers determine it is out of scope — which is far better than a real vulnerability going unreported.

---

## Security Hardening Goals

Codrawithm is in early ideation, but security is a design consideration from the start. The following security goals are planned for the platform:

- **Content Security Policy (CSP):** A strict CSP to limit the impact of any XSS vulnerabilities, especially given that the application may render user-provided diagrams and content.
- **Input sanitization:** All user-supplied content rendered to the DOM will be sanitized before rendering. No raw `innerHTML` insertion of untrusted content.
- **Plugin sandbox:** If a plugin system is introduced, plugins will run in a sandboxed context (e.g., a sandboxed iframe or a Web Worker) with no direct access to the host application's DOM or data.
- **Local-first data handling:** Board data stored locally should not be transmitted to any server without explicit user action. The privacy model will be documented clearly.
- **Dependency security:** Dependencies will be pinned to exact versions. Automated dependency auditing (e.g., `npm audit` or `cargo audit`) will run in CI.
- **Authentication (if a backend is introduced):** Standard secure authentication practices — no credential storage in localStorage, HTTP-only cookies for session tokens, and CSRF protection on state-changing endpoints.
- **Least privilege:** Any backend service will follow the principle of least privilege for database and filesystem access.

These goals will be refined and expanded as the architecture is finalized.

---

## Contact

For security reports: use [GitHub's private security advisory feature](https://github.com/KanishJebaMathewM/Codrawithm/security) or contact the repository maintainers directly through GitHub.

For general security questions or discussion of the security model: [GitHub Discussions](https://github.com/KanishJebaMathewM/Codrawithm/discussions).
