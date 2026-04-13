# Authup Testing Reference

Reference: [authup/authup/.agents/testing.md](https://github.com/authup/authup/blob/master/.agents/testing.md)

This documents the testing patterns Hub should adopt (see Plans 004-005).

## Test Layers

Authup has two test layers — Hub currently only has HTTP integration tests and should add service-level tests.

### Service-Level Tests (Hub needs to add)

Location: `test/unit/core/entities/{entity}/service.spec.ts`

Test business logic in isolation using **fake repositories** (in-memory) and **mock permission evaluators**. No HTTP, no database, no Docker. Each test runs in ~1ms.

```typescript
describe('AnalysisService', () => {
    let service: AnalysisService;
    let repository: FakeEntityRepository<Analysis>;

    beforeEach(() => {
        repository = new FakeEntityRepository<Analysis>();
        service = new AnalysisService({ repository });
    });

    it('should deny creation without permission', async () => {
        const actor = createDenyAllActor();
        await expect(service.create({ name: 'test' }, actor)).rejects.toThrow();
    });

    it('should create with valid data', async () => {
        const actor = createAllowAllActor();
        const result = await service.create({ name: 'test', project_id: '...' }, actor);
        expect(result.name).toBe('test');
    });
});
```

**Test helpers needed:**
- `FakeEntityRepository<T>` — in-memory `IEntityRepository` backed by an array
- `createAllowAllActor()` — mock `ActorContext` that allows everything
- `createDenyAllActor()` — mock `ActorContext` that denies everything
- `createMasterRealmActor()` / `createNonMasterRealmActor(realmId)` — realm-specific actors

**What to test:** permission gates, validation, realm defaulting, uniqueness, error paths.

### HTTP Integration Tests (Hub already has)

Location: `test/unit/http/controllers/entities/{entity}.spec.ts`

Full app bootstrap with database. Tests HTTP client compatibility, request/response shaping, middleware pipeline.

## Coverage Targets

| Layer | Authup Target | Hub Target |
|-------|---------------|------------|
| Core entity services | 95-100% | 95-100% (once services exist) |
| Workflow services | 94-100% | Same |
| HTTP controllers | Covered by integration tests | Same |

## Testing Philosophy

From authup's docs:

> Tests should assert *expected* behavior based on the service contract and architecture docs — not merely confirm what the implementation currently does. If a test fails, it may surface a real bug in the implementation rather than a test error.

This is important for Hub's migration: when writing service-level tests during the hexagonal refactor, test the intended behavior, not the current handler behavior.

## Database Testing

| Backend | Authup | Hub |
|---------|--------|-----|
| MySQL | Port 3306 | Port 3306 |
| PostgreSQL | Port 5432 | Port 5432 |
| SQLite | In-memory | In-memory |
| Redis | Port 6379 | Port 6379 |

Both use `docker-compose.yml` for local database services. Both run multi-database CI matrix.

## Key Difference: Service-Level Tests

Authup's service-level tests are the **primary test layer** — they catch business logic bugs without the overhead of HTTP/DB. Hub currently tests everything through HTTP integration tests, which are slower and don't isolate business logic.

**Migration plan:** As each entity gets a service class (Plan 004), add corresponding service-level tests. Over time, the service-level tests become the primary suite and HTTP tests become a thinner integration verification.
