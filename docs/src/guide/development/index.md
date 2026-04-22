# Development

Welcome to the PrivateAIM Hub development guide. This section covers contributing to the project, understanding the codebase, and working with the API.

## Guides

- [Repository Structure](/guide/development/repository-structure) — monorepo layout and package overview
- [API Reference](/guide/development/api) — REST API endpoints and usage

## Quick Start

```bash
npm ci          # Install dependencies
npm run build   # Build all packages
npm run test    # Run test suite
npm run lint    # Check code style
```

## Commit Convention

This project uses **Conventional Commits** enforced by commitlint + Husky:

```
type(scope): description
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`

Examples:
```
feat(server-core): add analysis bucket file upload
fix(deps): bump the minorandpatch group with 10 updates
refactor(server-storage): extract bucket validation to core layer
```

## Code Style

ESLint 10 with `@tada5hi/eslint-config`. Husky pre-commit hooks automatically lint staged files.

```bash
npm run lint          # Check
npm run lint:fix      # Auto-fix
```
