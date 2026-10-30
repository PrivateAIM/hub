# Development

Welcome to the FLAME Hub development guide. This section covers contributing to the project, understanding the codebase, and working with the API.

## Guides

- [Repository Structure](/guide/development/repository-structure) — monorepo layout and package overview
- [API Reference](/guide/development/api) — REST API endpoints and usage

## Quick Start

Node.js **≥26.0.0** and npm are required for all workspaces.

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

ESLint 10 with `@tada5hi/eslint-config` 3. Husky pre-commit hooks automatically lint staged files.
Exported type declarations live in `types.ts`, interfaces use an `I` prefix, and
barrels export local modules rather than forwarding external packages. Existing
public type names are retained as type aliases where possible.

### Package import changes

The lint-rule migration removes external-package forwarding exports. Consumers
should import these helpers from their owning packages:

- `BASE_ERROR_INSTANCE`, `INSTANCEOF_PROPERTY`, `hasInstanceof` and `markInstanceof`
  from `@ebec/core`, not `@privateaim/errors`.
- The default `clientWebKitTheme` export and named `merge` export from
  `@authup/client-web-kit-theme`, not `@privateaim/client-vue-theme`.
- `FakePermissionEvaluator`, `EvaluatorBehavior`, `EvaluatorCall` and
  `EvaluatorMethodName` from `@authup/server-test-kit`, not
  `@privateaim/server-test-kit`.

Entity and other public type names remain available at their existing package roots;
internal source files have been consolidated into `types.ts`.

```bash
npm run lint          # Check
npm run lint:fix      # Auto-fix
```
