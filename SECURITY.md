# Security Policy & Vulnerability Reporting

## Supported Versions

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 1.0.x   | :white_check_mark: | Active SIH 2026 Submission Release |
| < 1.0.0 | :x:                | Deprecated Prototypes |

## Security Model & Principles

NEVIA (Regional Mobility Intelligence) manages critical road accessibility, weather intelligence, and essential goods dispatch data for the North Eastern Region of India. The project adheres to strict operational and data integrity standards:

1. **Zero Secret Exposure**: No credentials, API tokens, or server-side secrets are ever committed to version control. All external integrations (e.g., IMD meteorological services) use environment-injected variables.
2. **Deterministic Role Segregation**: User actions are partitioned into four dedicated operational workflows (*Logistics Coordinator*, *Driver*, *Field Reporter*, *Authority / Verifier*). Sensitive operational overrides (e.g., declaring a mountain highway closed) require explicit authority authorization.
3. **Data Provenance & Auditability**: Every field report, AI inference score, and verification timestamp is logged with cryptographic hashes and source attribution to prevent misinformation during regional crisis response.
4. **Offline Resilience**: Field worker data captured in disconnected mountain areas is held securely in client-side IndexedDB and synchronized using idempotency keys upon link restoration.

## Reporting a Vulnerability

If you discover a security vulnerability or sensitive data leakage within this repository, please report it responsibly:

- **Team**: INNOVEXA (SIH 2026 - Problem ID: SIH26002)
- **Primary Contact**: Create an issue labeled `security` or contact the team maintainers via GitHub.
- **Disclosure Policy**: Please allow reasonable time for the development team to triage and patch the issue before public disclosure.

Thank you for helping keep regional logistics infrastructure secure.
