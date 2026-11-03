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

Why this matters: the failure is silent and looks like a working page. A detail
page whose route param stopped resolving rendered — and permitted edit and delete
of — the first row in scope, which is how a registry project's Harbor robot
`accountSecret` ended up in a form belonging to a different record.

`packages/client-vue/test/unit/core/entity-manager.spec.ts` pins every branch, and
`test/unit/components/f-master-image-picker.spec.ts` pins the create-mode path on a
real form component.

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

Both halves fail **silently** — an unmatched glob or a composed name yields an
empty icon slot, not a build error. `apps/client-ui/test/unit/icon-bundle.spec.ts`
guards the glob list by pinning one uniquely-attributable icon per scanned
source; it drives the real plugin, so it needs no build output.

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
  Pass `{ realtime: true }` as the harness's fourth argument to opt in —
  `test/unit/core/realtime-gate.spec.ts` pins both sides of that gate,
  because a consumer that forgets the option loses realtime SILENTLY.

Cross-package test imports resolve through `dist`, so the kits must be built
first. `nx.json`'s `test: { dependsOn: ["^build"] }` handles that for
`npx nx run-many -t test`; a bare `npm run test -w packages/client-vue` on a
cold tree does not.

## Build-Config Tests (client-ui)

`apps/client-ui/test/` is a plain node vitest config with no plugins — it
renders nothing. Its one suite, `unit/icon-bundle.spec.ts`, guards the icon
subset the app ships (see [conventions.md](#icons)) by pinning one
uniquely-attributable icon per scanned source, so removing any glob fails
exactly one assertion.

It drives the real `@nuxt/icon` plugin object — `load('\0virtual:nuxt-icon-bundle')`
runs the whole scan → resolve → generate path by itself — rather than reading a
built bundle. That is deliberate: CI's build cache carries only `**/dist/**` and
`.nx`, so `apps/client-ui/.output` does **not** survive into the test job, and a
spec asserting against it would either fail or need extra cache plumbing.
Asserting a rendered page cannot work at all — `@iconify/vue` resolves icons
client-side, so SSR output carries empty `<svg>` shells either way.

Note `nuxi typecheck` (client-ui's `build:types`) **does** cover `test/**` under
Nuxt 4 strict, unlike every other workspace, whose `tsconfig.build.json` includes
`src/**` only.

## SSR hydration handoff (#1805)

SSR hydration handoff (#1805) — Implemented (what the server render fetched now reaches the browser instead of being discarded). client-ui runs `ssr: true`, but every detail page fetched its record **twice**, and a list's initial load ran in a detached microtask that resolved *after* the HTML was flushed — the server paid for the request and shipped an empty list anyway. The seam is `@authup/client-web-kit`'s hydration store, provided by `@authup/client-web-nuxt`'s kit plugin over `nuxtApp.payload.data` (both already dependencies at beta.63 — **no authup bump**). Hub adds **no install option and no plugin**: `createListRaw` calls `injectHydrationStore()` and no-ops when it returns `undefined`, so a host without one skips the server-side load entirely rather than rendering rows the hydrating client cannot reproduce. Four things in it are not obvious:

- **The list key is `flame:list:<type>:${useId()}`, never the query.** A query-derived key has to be re-derived *identically* on the client, which makes filter insertion order, a `query` prop assembled from store state that is not populated yet on one side, and two same-query lists on one page all load-bearing — and each of those fails **silently**, as a list that simply fetches twice again. Vue 3.5's `useId` is stable per component-tree position across the boundary, so agreement is structural rather than something a caller can get wrong. The entity type is in the key only to bound the blast radius of an entry that is recorded but never adopted.
- **`onServerPrefetch` is registered on BOTH sides, and that is load-bearing.** A non-empty `instance.sp` is what makes Vue call `markAsyncBoundary()` after setup, giving the component's subtree a fresh `useId` counter; `instance.sp` is read in exactly two places (`runtime-core`'s boundary check and `@vue/server-renderer`, the only invoker). Registering the hook only under `isServerRuntime()` marks the boundary only on the server, so every `useId()` inside or after a list shifts between renders — a second same-type list then derives the key the server used for the FIRST one and adopts the wrong rows, with its own load suppressed so it never corrects. `list-hydration.spec.ts`'s two-list round trip is the negative control; it fails the moment the registration is moved back inside the server branch.
- **The composed `query` travels in the snapshot.** `query` is assigned nowhere but inside `load()`, which the adopting client skips, and the socket handler reads its sorts to decide whether a realtime-created entity belongs at the top of a full first page. Without it, realtime inserts stop silently on every hydrated list (a ≥10-row list on `/projects`, `/projects/in`, `/admin/nodes`, …) until the user pages or searches.
- **A collection query must not request a permission-gated column any more.** The list's rows now reach the payload, i.e. the served HTML document. `fields: ['+accountSecret']` was dropped from the registry-projects list: nothing there rendered it (the details modal re-resolves by id with its own `+accountSecret`), so it was pure over-fetch that would have put every Harbor robot secret into the document.
- **Only a load that ran to completion may be recorded.** An adopted snapshot *suppresses* the client's own load, so recording what a failed — or coalesced-away — load left behind strands the list on it with no retry. The `loaded` flag set at the end of `load()`'s try block is the enforcement point: `onServerPrefetch` awaits `load()` in a try/catch and records nothing unless it is set. `onServerPrefetch` is also what makes the renderer **wait**, which puts a list's upstream latency on the SSR critical path — the nine `[id].vue` detail pages already blocked SSR by awaiting in `setup()`, so this is not a new class of dependency.
- **`useAsyncData` needs `deep: true`.** Nuxt 4 returns a `shallowRef`, and every one of the nine pages mutates its entity **per property** (`updateObjectProperties` does `src.value[key] = …`, or `extendObject`), so without it the page silently stops updating after a save. `useEntityRecord` centralises it. A second Nuxt trap sits next to it: 4.5.2's `asyncData.js` **defers** `initialFetch` to `onBeforeMount` during hydration when the payload holds no entry for the key, so `await useAsyncData(...)` can resolve with `data.value === undefined` **and** `error.value === null` — a guard of the form `if (error.value || !data.value) redirect` therefore bounces a page that is merely late.
- **No authenticated route may get an `swr` or `isr` route rule** — the payload is per-request, and a cached one would be served to the wrong session. `apps/client-ui/nuxt.config.ts` declares exactly one route rule, `'/login/callback': { ssr: false }`.

One consequence is accepted rather than fixed: list rows now render on the server, which puts `<VCTimeago>` on both sides of the boundary for the first time. It computes a relative string during `setup()`, so a bucket crossing between render and hydration — or clock skew — is a text mismatch, and Vue `console.error`s those in production builds too. Vue repairs the text; the cost is console noise on list pages and one more thing to rule out when debugging a real mismatch. The fix belongs upstream in `@vuecs/timeago` (SSR-stable first render, relative string in `onMounted`).

Deliberately **not** done: records resolved by `createEntityManager` (a separate producer, tracked as a follow-up issue) and the pages that `await getMany` rather than a record (`pages/projects/[id].vue`, `pages/projects/index/in.vue`, `pages/admin/services/registry/index/client.vue`). Documented in [reference/frontend](../../docs/src/reference/frontend/index.md#server-rendering-and-hydration).
