# Testing

The confirmed testing depth is custom: a small set of basic behavior tests, with no coverage target or exhaustive test requirement.

| Surface | Requirement | Depth | Dependency strategy |
| --- | --- | --- | --- |
| Configuration and shared command behavior | Required | Basic valid input and important invalid input | In-memory inputs |
| Statistics dispatch and output semantics | Required | Representative successful, missing-data, and error behavior | Test doubles and fabricated data |
| Live Discord and Tracker access | Not required in automated tests | Manual smoke checks when needed | Real services, explicitly run by developers |
| Container build and browser runtime | Not required in automated tests | Manual smoke checks for packaging changes | Local Docker engine |

- Add or update a small behavior test when changing covered basic behavior or fixing a regression. Do not require a test for every function or low-impact reversible edit.
- Use Node.js's built-in test runner and assertions. Unit tests must run without credentials, browser installation, or real network access.
- `npm test` selects only `tests/*.test.ts`. Keep `scripts/` out of unit tests and CI execution.
- Write manual scripts in TypeScript and execute them directly with Node.js 24. Do not emit JavaScript versions of those scripts.
- Keep linting, type checking, production builds, and configured tests required independently of whether a surface has a dedicated automated test.
