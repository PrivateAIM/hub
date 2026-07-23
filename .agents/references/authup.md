# Authup Reference

Hub integrates [Authup](https://github.com/authup/authup) as its OAuth2 identity provider for authentication, authorization, and multi-tenant realm management.

## Version Snapshot (as of 2026-04-13)

| | Version | Date | Commit |
|---|---------|------|--------|
| **Latest stable** | v1.0.0-beta.32 | 2026-03-30 | — |
| **Hub pinned** | ^1.0.0-beta.31 | 2026-04-13 | — |
| **Master HEAD** | — | 2026-04-13 | `b95589a06e8907cefcb8b1c704682928d513766e` |

### Hub Dependency Versions

| Package | Pinned Version |
|---------|---------------|
| `@authup/kit` | ^1.0.0-beta.31 |
| `@authup/core-kit` | ^1.0.0-beta.31 |
| `@authup/access` | ^1.0.0-beta.31 |
| `@authup/server-adapter-*` | ^1.0.0-beta.31 |
| `@authup/client-web-kit` | ^1.0.0-beta.31 |
| `@authup/client-web-nuxt` | ^1.0.0-beta.31 |
| `@authup/specs` | ^1.0.0-beta.31 |
| `@authup/core-http-kit` | ^1.0.0-beta.31 |
| `@authup/core-realtime-kit` | ^1.0.0-beta.31 |

### Breaking Changes in beta.31

| Old (`@authup/access`) | New | PR |
|---|---|---|
| `PermissionChecker` | `PermissionEvaluator` | #2943 |
| `PermissionMemoryRepository` | `PermissionMemoryProvider` | #2943 |
| `IPermissionRepository` | `IPermissionProvider` | #2943 |
| `IPermissionChecker` | `IPermissionEvaluator` | #2943 |
| `PermissionCheckerCheckContext` | `PermissionEvaluationContext` | #2943 |
| `PermissionItem` (flat `{ name }`) | `PermissionBinding` (nested `{ permission: { name } }`) | #2950 |
| `.check()` / `.preCheck()` | `.evaluate()` / `.preEvaluate()` | #2943 |
| `.checkOneOf()` / `.preCheckOneOf()` | `.evaluateOneOf()` / `.preEvaluateOneOf()` | #2943 |
| `PolicyIdentity` (`@authup/kit`) | `IdentityPolicyData` (`@authup/access`) | #2943 |
| `store.permissionChecker` (`client-web-kit`) | `store.permissionEvaluator` | #2943 |

### Tri-state policy evaluation (`@authup/access` ≥ v1.0.0-beta.54, hub #1760)

`@authup/access` moved to a **data-availability-driven, tri-state** policy engine (authup #3286/#3290/#3291). The public API hub consumes — `IPermissionEvaluator.{evaluate,preEvaluate,evaluateOneOf,preEvaluateOneOf}` — is **unchanged**, so hub's `RequestPermissionChecker` (`packages/server-http-kit/src/request/permission/module.ts`) and the realtime-kit counterpart need no code change. What changed under the hood:

- **`preEvaluate` is now derived from data availability**, not a hardcoded type-exclusion list. A policy whose declared `requires()` data keys are absent from the `PolicyData` bag stays **pending** and passes the pre-gate (`pendingPolicies: 'permit'`); only a policy that *settles false* with the current bag denies. The full `evaluate()` with the enriched bag remains the authority (there, pending ⇒ deny). This replaces — and is obsolete relative to — the old mask-to-true `policiesExcluded: [ATTRIBUTES, ATTRIBUTE_NAMES, REALM_MATCH]` encoding, whose interaction with `invert` produced spurious settled denials at the pre-gate. `invert` is never applied to a pending result — unknown stays unknown.
- **Additive, non-breaking members** (safe to ignore; nothing in hub implements `IPolicyEvaluator`): `IPolicyEvaluator.requires?()` / `toCondition?()`, `PolicyEvaluationResult.{pending,condition}`, `PermissionEvaluationOptions.pendingPolicies`, the `withConditions` evaluation-context flag, and a new additive `IPermissionEvaluator.compile()` (row-condition/WHERE-pushdown authorization — hub does not use it yet; a future follow-up could push a pending residual's `condition` into the rapiq query instead of dropping rows post-load).
- Requires `@rapiq/* ≥ 2.0.0-beta.6` (first-class `not()`, the null-inclusive complement used by condition lowering).
- **Guard rail for future hub-authored policy evaluators:** any custom `IPolicyEvaluator` hub registers must ship `requires()` (and optionally `toCondition()`), or it runs at the pre-gate against missing data (fail-closed, but exactly the spurious-denial class this migration removes). Hub registers none today.

## Code Mapping (Authup → Hub)

| Concept | Authup | Hub |
|---------|--------|-----|
| **Token middleware** | `@authup/server-adapter` | `packages/server-kit/src/` (auth middleware setup) |
| **Permission checks** | `@authup/access` | `packages/server-http-kit/src/` (route-level guards) |
| **Realm resolution** | `@authup/core-kit` | `packages/server-kit/src/` (realm context on requests) |
| **Client session** | `@authup/client-web-nuxt` | `apps/client-ui/` (Nuxt module registration) |
| **Identity types** | `@authup/kit` | `packages/kit/src/` (re-exported where needed) |

## Integration Points

- **Server-side**: Routup middleware validates bearer tokens on every request, resolves user/robot identity, and attaches it to the request context
- **Client-side**: Nuxt module handles OAuth2 login flow, token refresh, and session state via Pinia
- **Realms**: Multi-tenant isolation — entities are scoped to realms, permission checks are realm-aware

## Areas to Watch

When Authup updates, review for:
- Breaking changes in middleware API or token validation
- New permission/scope patterns in `@authup/access`
- Nuxt module configuration changes in `@authup/client-web-nuxt`
- Realm API changes that affect entity scoping
