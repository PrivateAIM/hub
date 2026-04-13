# Authup Conventions Reference

Reference: [authup/authup/.agents/conventions.md](https://github.com/authup/authup/blob/master/.agents/conventions.md)

This documents the conventions Hub should adopt as part of modernization (see Plans 001, 003-005).

## Tooling Comparison

| Tool | Authup | Hub (Current) | Hub (Target) |
|------|--------|---------------|--------------|
| Task runner | Nx | Nx | Nx (keep) |
| JS bundling | Rollup | Rollup | tsdown (Plan 001) |
| Linting | ESLint + `@tada5hi/eslint-config-vue-typescript` | ESLint 8 + same config | ESLint 10 + `@tada5hi/eslint-config` (Plan 001) |
| Test runner | Vitest + SWC | Vitest + SWC | Keep |
| Pre-commit | Husky + lint-staged | Husky + lint-staged | Keep |
| Commit style | commitlint (Conventional Commits) | commitlint | Keep |

## Validation & Error Handling

**Authup pattern:**
- Validation uses `validup` framework with `@validup/adapter-zod`
- Validators run inside core services, not controllers
- Services receive raw `Record<string, any>` and call `validator.run(data, { group })`
- Errors use `@authup/errors` (HTTP-aware via `@ebec/http`)

**Hub current:** Validation is mixed — some in handlers, some in kit validators. Should converge to service-layer validation.

**Hub target:** Match authup — validators in services, raw data from controllers.

## File Organization Rules

1. Exported **types** must live in `types.ts` files, not inline in implementation
2. Barrel `index.ts` files re-export from `types.ts` and implementation modules
3. No explanatory comments unless explicitly requested

## Configuration Naming

| Pattern | Example |
|---------|---------|
| Boolean toggles | `registrationEnabled`, `skipProjectApproval` |
| Env vars | `REGISTRATION_ENABLED`, `SKIP_PROJECT_APPROVAL` |
| Config keys | camelCase matching TypeScript property |

Hub currently uses `SKIP_PROJECT_APPROVAL` and `SKIP_ANALYSIS_APPROVAL` — these already follow the pattern.

## Workflow Convention

After making changes, always:
1. Build the affected package: `npm run build -w <workspace>`
2. Run ESLint on changed files: `npx eslint --fix path/to/changed/files`
3. Fix any build or lint errors before considering done

## Best Practices (from Authup, applicable to Hub)

- Use **ESM** and modern TypeScript/JavaScript
- Prefer **Web APIs** over Node.js-specific APIs where possible
- Use hexagonal architecture in services
- Use domain interfaces (from `core-kit`) in ports, TypeORM entity classes only in adapters
- Before adding new code, study surrounding patterns and naming
- No `useX()` singleton accessors — use DI constructor injection
