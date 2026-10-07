# AGENTS.md

## Mandatory Instructions

Before making changes, read and follow:

- `docs/standards/common/development-guidelines.md`

Treat it as mandatory repository-wide guidance.

The repository root is the single application scope. For application-specific changes, also follow:

- `docs/standards/r6bot/development.md`
- `docs/standards/r6bot/coding-style.md`
- `docs/standards/r6bot/testing.md`
- `docs/standards/r6bot/security-privacy.md`

## Hard Constraints

- Keep generated output and secrets out of version control.
- Keep manual checks separate from automated test execution.

## Development Documentation

- Store development documentation under `docs/`.
- Review relevant documentation before development.
- For new features or changes to documented architecture, design, or behavior, update the relevant documentation first, then implement according to it.
- Prefer updating existing documentation over creating duplicate or conflicting documents.
- Keep documentation consistent with the current implementation, concise, and focused on information needed for development and maintenance.
- Write project development documentation in en-US.
- Keep all `AGENTS.md` files and files under `docs/standards/` in en-US.

## Instruction Precedence

Follow instructions in this order:

1. Explicit task requirements.
2. The closest applicable `AGENTS.md`.
3. This root `AGENTS.md`.
4. Documents referenced by the applicable `AGENTS.md`.
5. Existing implementation patterns that do not conflict with the above.

Scoped `AGENTS.md` files may specialize local rules but must not weaken repository-wide hard constraints.

## Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for all commit messages.

Write commit messages in en-US while keeping Conventional Commits types and scopes in English.
