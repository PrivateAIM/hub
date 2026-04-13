# Conventions

## Commit Messages

**Conventional Commits** enforced by commitlint (`@tada5hi/commitlint-config`) + Husky:

```
type(scope): description

# Examples:
feat(server-core): add analysis bucket file upload
fix(deps): bump the minorandpatch group with 10 updates
chore: release master
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`

## Linting

ESLint 10 with `@tada5hi/eslint-config` (flat config):

```bash
npm run lint          # Check
npm run lint:fix      # Auto-fix
```

Config: `eslint.config.js` — extends `@tada5hi/eslint-config` with Vue-specific overrides (`no-explicit-any` off for `.vue` files). Ignores: `dist`, `*.d.ts`, `node_modules`, `.nuxt`, `.nx`, `writable`, `.output`.

## Pre-commit Hooks

Husky runs on every commit:
1. **lint-staged** — ESLint with fix on `*.{vue,js,ts}`
2. **commitlint** — Validates commit message format (`commitlint.config.mjs`)

## Build System

### Libraries (kits)

Built with **tsdown** (powered by rolldown/oxc):

```bash
npm run build         # rimraf dist/ && tsdown
```

Config: `tsdown.config.ts` per package — `entry: 'src/index.ts'`, `format: 'esm'`, `dts: true`, `sourcemap: true`.

Output: ESM only (`dist/index.mjs`) with TypeScript declarations (`dist/index.d.mts`).

**Special case:** `client-vue` uses `@vitejs/plugin-vue` + `@tsdown/css` for Vue SFC compilation, with `vue-tsc` for type declarations (`dts: false` in tsdown, separate `build:types` script).

### Services

Built with **tsdown** (JS) + **tsc** (type declarations):

```bash
npm run build:js      # tsdown (bundle: false, preserves directory structure)
npm run build:types   # tsc --emitDeclarationOnly -p tsconfig.build.json
npm run build         # rimraf dist/ + both above
```

Config: `tsdown.config.ts` per service — `entry: ['src/**/*.ts']`, `format: 'esm'`, `bundle: false`, `dts: false`, `sourcemap: true`.

Output: ESM files (`dist/**/*.mjs`) preserving source directory structure, plus TypeScript declarations (`dist/**/*.d.ts`). CLI entry points at `dist/cli/index.mjs`.

### Nx Orchestration

Nx handles cross-package build ordering via `dependsOn: ["^build"]` in `nx.json`. Build results are cached.

```bash
npm run build         # npx nx run-many -t build
npm run test          # npx nx run-many -t test
```

## TypeScript

- Extends `@tada5hi/tsconfig` with project-specific overrides
- Target: ES2022, Module: ESNext, ModuleResolution: bundler
- `strict: false` (migration to `strict: true` is a future effort)
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`) — required for TypeORM entities
- All packages use `"type": "module"` (ESM-only, no CJS exports)

## Validation

**Zod 4** schemas via `validup` adapters. Domain types in kit packages have corresponding validators:

```typescript
// packages/core-kit/src/domains/<entity>/validator.ts
import { z } from 'zod';
export const analysisSchema = z.object({
    name: z.string().max(128).optional(),
    // ...
});
```

## Release Process

Automated via **release-please** (Google) for versioning + **monoship** (`tada5hi/monoship@v2`) for npm publishing. Creates release PRs that bump versions across all packages in lockstep (current: 0.8.31).

## Docker

Multi-service `Dockerfile` builds the entire monorepo. The `entrypoint.sh` script selects which service to start based on env vars.

```bash
docker build -t privateaim/hub .
docker-compose up       # Local dev: MySQL + Postgres
```

## References

External project references live in `.agents/references/`. When looking up source code in a referenced project (e.g., authup, routup, hapic), always update the corresponding reference file with:

- The source file path / function name in the external project
- The corresponding Hub file path / function name
- Any behavioral differences between the implementations

This builds a cumulative mapping over time so future work can quickly find corresponding code without re-searching.
