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

ESLint 8 with `@tada5hi/eslint-config-vue-typescript`:

```bash
npm run lint          # Check
npm run lint:fix      # Auto-fix
```

Key rules:
- Max import cycle depth: 2
- Dev dependencies allowed in test files
- Ignores: `/dist`, `*.d.ts`, `node_modules`, `.nuxt`

## Pre-commit Hooks

Husky runs on every commit:
1. **lint-staged** — ESLint with fix on `*.{vue,js,ts}`
2. **commitlint** — Validates commit message format

## Build System

### Libraries (kits)

Built with **Rollup** using the shared `rollup.config.mjs`:

```bash
npm run build:js      # Rollup -> dist/index.mjs
npm run build:types   # tsc -> dist/index.d.ts
npm run build         # rimraf dist/ + both above
```

Rollup plugins: `@rollup/plugin-node-resolve`, `@rollup/plugin-commonjs`, `@rollup/plugin-json`, `@rollup/plugin-esm-shim`, `unplugin-swc`

Output: ESM only (`dist/index.mjs`) with TypeScript declarations.

### Services

Built with **tsc** directly:

```bash
npm run build         # tsc -p tsconfig.build.json
```

### Nx Orchestration

Nx handles cross-package build ordering via `dependsOn: ["^build"]` in `nx.json`. Build results are cached.

```bash
npm run build         # npx nx run-many -t build
npm run test          # npx nx run-many -t test
```

## TypeScript

- Target: ES2022, Module: ESNext, ModuleResolution: bundler
- `strict: false`
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- All packages use `"type": "module"` (ESM-first)

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

Automated via **release-please** (Google). Creates release PRs that bump versions across all packages in lockstep (current: 0.8.31).

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
