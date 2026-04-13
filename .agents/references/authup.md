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

## Code Mapping (Authup → Hub)

| Concept | Authup | Hub |
|---------|--------|-----|
| **Token middleware** | `@authup/server-adapter` | `packages/server-kit/src/` (auth middleware setup) |
| **Permission checks** | `@authup/access` | `packages/server-http-kit/src/` (route-level guards) |
| **Realm resolution** | `@authup/core-kit` | `packages/server-kit/src/` (realm context on requests) |
| **Client session** | `@authup/client-web-nuxt` | `packages/client-ui/` (Nuxt module registration) |
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
