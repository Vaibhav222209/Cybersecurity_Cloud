# Security Policy

## About this project

Ramzure is a **client-side educational simulator**. It has no backend, stores no real credentials,
and does not connect to any real cloud provider. All "secrets", "users" and "threats" are simulated
and kept in your browser's `localStorage`.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅        |

## Reporting a vulnerability

If you discover a security issue in Ramzure (for example an XSS vector, an unsafe dependency, or a
supply-chain concern in the build/deploy workflows):

1. **Do not** open a public issue.
2. Use GitHub's **[private vulnerability reporting](https://github.com/Vaibhav222209/ramzure/security/advisories/new)**
   or contact the maintainer, [Vaibhav Thakur](https://github.com/Vaibhav222209), via his GitHub profile.
3. Include steps to reproduce, affected versions and potential impact.

You can expect an acknowledgement within **72 hours** and a fix or mitigation plan within **14 days**
for confirmed issues.

## Good practices for contributors

- Never commit real credentials, API keys, or personal data.
- Keep dependencies up to date (Dependabot is enabled).
- Avoid `dangerouslySetInnerHTML` and untrusted HTML rendering.
