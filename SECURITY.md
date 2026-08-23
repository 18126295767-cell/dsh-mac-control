# Security Policy

## Scope and support

Security reports for this repository are welcome. The latest default branch is the supported version. This plugin is macOS-only and runs local Apple Automation, Accessibility, and Screen Recording commands on behalf of the DeepSeek Harness host.

## Security boundary

- No HTTP server or browser proxy is started.
- Credentials, cookies, API keys, passwords, and recovery codes are not accepted as tool arguments or stored by the plugin.
- Browser URLs are restricted to absolute `http` and `https` URLs.
- Coordinates, text, app names, and browser names are validated.
- Browser and desktop mutations require approval by default.
- Screenshots are written locally with restrictive directory permissions; review and remove them according to your own retention policy.

## Reporting a vulnerability

Please use GitHub's private security advisory flow for this repository when available. If it is unavailable, open an issue containing only a short, non-sensitive description and request a private contact path. Do not upload exploit code, credentials, cookies, private screenshots, or user data to a public issue.

Include the affected commit or version, macOS and Node.js versions, a minimal reproduction that contains no secrets, and the impact. We will acknowledge reports as soon as practical and coordinate a fix or mitigation before public disclosure.

