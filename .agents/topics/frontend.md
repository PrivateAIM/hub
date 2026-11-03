# Frontend (client-ui, client-vue)

Read before changing apps/client-ui or packages/client-vue.

## Entity Resolution (client-vue)

`createEntityManager` resolves an entity two ways, and they are mutually
exclusive by design — **an id-driven resolve never falls back to the collection.**

- **By id.** An id that was *supplied* is an exact selector: resolve that record
  or nothing. A `getOne` that throws (404, 403) resolves `null`; it must not drop
  into the collection branch, which would substitute a different entity for the
  one that was asked for.
- **By query.** Only when no id was supplied, and only when the query carries a
  real selector. `fields` and `include` say *what* to return, never *which* row,
  so a projection-only query matches everything and the `limit: 1` read hands
  back an arbitrary record from the actor's readable scope.

**Supplied is presence, not truthiness.** `''` is a supplied id — it is how a
form says "no entity yet" (`FProjectForm` initialises `form.masterImageId = ''`
and passes it straight in as `entityId`). It resolves `null` quietly, with no
request: a blank id must not reach `getOne` either, because `getOne('')` builds
`GET /<collection>/` and lets the arbitrary-row read back in through another
door. `null` and `undefined` are *absent*, so they still fall through to the
query branch.

A selector means at least one filter whose value is not `undefined` — rapiq drops
`undefined` values before the request, so `{ analysisId: undefined, type: 'code' }`
widens to every code bucket rather than narrowing. `null` stays a selector; it is
a meaningful filter value.

The helpers are `isEntityIdSupplied` / `isEntityIdResolvable` / `hasQuerySelector`
in `packages/client-vue/src/core/entity-manager/utils.ts`, and they are **type
guards** rather than boolean predicates — the truthiness checks they replaced were
also narrowing `EntityID<RECORD> | null | undefined` for the `getOne` call. Only
`nuxi typecheck` (Nuxt 4 strict, via client-ui's `build:types`) catches losing
that; the repo itself builds at `strict: false`.

The failure is silent and looks like a working page: a detail page whose route
param stops resolving renders, and permits edit and delete of, the first row in
scope.

## Icons

`apps/client-ui` bundles only the icons it renders: `@nuxt/icon`'s standalone
vite plugin (options in `apps/client-ui/icon-bundle.config.ts`) scans source for
`<collection>:<name>` literals and emits that subset into
`virtual:nuxt-icon-bundle/register`, which `plugins/vuecs.ts` imports. It
registers through `addIcon` from `@iconify/vue` — the same global store
`<VCIcon>` resolves against — so no component knows about it.

**Rule: an icon name must be a literal.** A composed name is invisible to the
scan, so it is never bundled and `@iconify/vue` falls back to fetching it from
the public Iconify API at runtime:

```vue
<!-- Bad — never bundled; resolved over the network, or not at all -->
<VCIcon :name="'fa6-brands:' + entity.buildOs" />

<!-- Good — a computed switch over literals (FProcessStatus.vue,
     FAnalysisBuildStep.vue) -->
<VCIcon v-if="buildOsIcon" :name="buildOsIcon" />
```

The same applies to `packages/client-vue` and `packages/client-vue-theme`: they
are scanned as source, and they are published, so a consuming app's scanner sees
exactly the same literals.

Both halves fail **silently**: an unmatched glob or a composed name yields an
empty icon slot, not a build error. A new scanned source needs an icon assertion
in `apps/client-ui/test/unit/icon-bundle.spec.ts`.

## Component Tests (client-vue)

`packages/client-vue` is hub's only non-node vitest environment:
`test/vitest.config.ts` uses `environment: 'happy-dom'` and `plugins: [vue()]`,
where every other suite is `plugins: [swc.vite()]` on node.

Mount through the shared harness, `packages/client-vue/test/utils/index.ts`:

```typescript
const { wrapper, coreClient } = mountClientVueComponent(
    FEntityDelete,
    { entityId: 'abc', entityType: 'project', withPrompt: false },
    { core: { 'DELETE /projects/:id': () => ({ data: {}, meta: {} }) } },
);

await wrapper.trigger('click');
expect(coreClient.requests[0]).toMatchObject({ method: 'DELETE', params: { id: 'abc' } });
```

Things the harness handles, and why they matter:

- **client-vue's `install` is not self-sufficient.** `@authup/client-web-kit`
  must be installed on the same app FIRST — `setupBaseHTTPClient` calls
  `injectHTTPClientAuthenticationHook(app)` and the `usePermissionCheck` sites
  call `injectStore()`. Installing only client-vue throws.
- **Pass the client via the `client` install option, never by pre-providing it.**
  Every `install*()` early-returns on `isXHTTPClientUsable(app)` and authup's
  `provide()` is first-wins, so an ordering mistake fails SILENTLY with the real
  `new Client({ baseURL })` winning.
- **`isServer: true`** on the authup install maps to the auth hook's
  `timer: !isServer`; without it a real refresh timer is armed in happy-dom and
  leaks across specs. The cookie noops avoid `useCookies`.
- **`stubs: { VCIcon: true }`.** `@vuecs/icon` resolves icon names through
  `@iconify/vue`, which FETCHES unknown icons from the iconify API — leaving it
  live makes every icon-rendering spec hit the network and happy-dom abort it at
  teardown. VTU's `stubs` matches by component name, so it also intercepts the
  `VCIcon` that `@vuecs/button` imports directly (a global `components`
  registration does not).
- **`realtime` is omitted** by default, so `installSocketManager` is skipped.
  Pass `{ realtime: true }` as the harness's fourth argument to opt in; a
  consumer that forgets the option loses realtime SILENTLY.

Cross-package test imports resolve through `dist`, so the kits must be built
first. `nx.json`'s `test: { dependsOn: ["^build"] }` handles that for
`npx nx run-many -t test`; a bare `npm run test -w packages/client-vue` on a
cold tree does not.

## Build-Config Tests (client-ui)

`apps/client-ui/test/` is a plain node vitest config with no plugins. Its suite
`unit/icon-bundle.spec.ts` guards the shipped icon subset (see [Icons](#icons))
with one uniquely-attributable icon per scanned source.

It drives the real `@nuxt/icon` plugin (`load('\0virtual:nuxt-icon-bundle')`)
rather than a built bundle: CI's build cache carries only `**/dist/**` and `.nx`,
so `apps/client-ui/.output` is absent in the test job. A rendered page cannot be
asserted either: `@iconify/vue` resolves icons client-side, so SSR output holds
empty `<svg>` shells.

Note `nuxi typecheck` (client-ui's `build:types`) **does** cover `test/**` under
Nuxt 4 strict, unlike every other workspace, whose `tsconfig.build.json` includes
`src/**` only.

## SSR hydration handoff (#1805)

client-ui runs `ssr: true`. Lists and detail records fetched during the server render reach the browser through `@authup/client-web-kit`'s hydration store (provided by `@authup/client-web-nuxt` over `nuxtApp.payload.data`). Hub adds no plugin or install option: `createListRaw` (`packages/client-vue/src/core/list/module.ts`) calls `injectHydrationStore()` and skips the server-side load when it returns `undefined`, so it never renders rows the client cannot reproduce.

- **The list key is `flame:list:<type>:${useId()}`, never the query.** A query-derived key must be re-derived identically on the client (filter order, store state not yet populated, two same-query lists), and every mismatch fails silently as a double fetch. `useId` agrees by tree position.
- **`onServerPrefetch` is registered on both sides.** A non-empty `instance.sp` makes Vue call `markAsyncBoundary()`, which resets the subtree's `useId` counter. Registering it only under `isServerRuntime()` shifts every later `useId()` between renders, so a second same-type list adopts the first one's rows and never corrects.
- **The composed `query` travels in the snapshot.** The adopting client skips `load()`, the only place `query` is assigned, and the socket handler reads its sorts to place realtime inserts; without it realtime inserts silently stop.
- **Only a completed load is recorded** (the `loaded` flag). An adopted snapshot suppresses the client's load, so recording a failed or coalesced-away load strands the list with no retry.
- **A collection query must not request a permission-gated column** (e.g. `+accountSecret`): its rows land in the served HTML payload. Resolve secrets per record.
- **Detail pages use `useEntityRecord`** (`apps/client-ui/composables/entity-record.ts`), never a bare `useAsyncData`. It sets `deep: true` (Nuxt 4 returns a `shallowRef`, and pages mutate the entity per property, so a shallow ref silently stops updating after a save) and `immediate: false` (otherwise Nuxt can defer the fetch to `onBeforeMount` during hydration, resolving with both `data` and `error` empty, so a `!data.value` redirect guard bounces a page that is merely late).
- **No authenticated route may get an `swr` or `isr` route rule**: the payload is per-request, and a cached one reaches the wrong session. `apps/client-ui/nuxt.config.ts` declares only `'/login/callback': { ssr: false }`.

Accepted: `<VCTimeago>` computes its relative string in `setup()`, so a bucket boundary or clock skew between render and hydration logs a text mismatch; the fix belongs upstream in `@vuecs/timeago`. Not hydrated: records resolved by `createEntityManager` and pages that `await getMany` directly. See [reference/frontend](../../docs/src/reference/frontend/index.md#server-rendering-and-hydration).
