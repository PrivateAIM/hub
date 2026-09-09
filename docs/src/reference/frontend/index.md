# Frontend (client-ui)

The frontend is a Nuxt 4 SSR web application that provides the user interface for managing projects, analyses, nodes, and platform administration.

## Running

```bash
# Development (from repo root)
npm run client-ui

# Docker
docker run -e ... privateaim/hub ui
```

## Dependencies

- **Core API** — REST API for all domain operations
- **Authup** — OAuth2 identity provider (login, registration, permissions)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_CORE_URL` | — | Core API base URL |
| `NUXT_PUBLIC_AUTHUP_URL` | — | Authup URL |
| `NUXT_PUBLIC_AUTHUP_CLIENT_ID` | `admin-console` | OAuth2 client used for the login (authorization-code) flow |
| `NUXT_PUBLIC_ACCOUNT_URL` | `<NUXT_PUBLIC_AUTHUP_URL>/account` | Authup account console, linked from the "Account" sidebar entry |
| `NUXT_PUBLIC_STORAGE_URL` | — | Storage service URL |
| `NUXT_PUBLIC_TELEMETRY_URL` | — | Telemetry service URL |
| `NUXT_PUBLIC_COOKIE_DOMAIN` | — (host-only) | `Domain` attribute for the session cookies. Leave empty unless a sibling host must read them — see [Session cookies](#session-cookies) |
| `NUXT_PUBLIC_MESSENGER_URL` | — | Messenger service URL |

## Authentication

The UI signs in with the **OAuth2 Authorization Code flow (PKCE)** — credentials are
never entered in the Hub UI itself. On the login page the user picks a **realm**
(`ARealmGrid`, which reveals a search field once more than 8 realms exist); the app
then builds an authorize URL and redirects to Authup's `/authorize` endpoint, where the
login form and configured identity providers live. Authup redirects back to
`<ui-origin>/login/callback`, and the `@authup/client-web-nuxt` routing interceptor
exchanges the authorization code for a session.

When the user was sent to the login page from a deep link, the post-login destination
rides in the callback URI's **own query** (`<ui-origin>/login/callback?redirect=%2Fprojects`),
so the authorization server carries it back and the interceptor navigates there after the
exchange. The same string is replayed byte-for-byte at the `/token` exchange
(RFC 6749 §4.1.3).

The OAuth client is configurable via `NUXT_PUBLIC_AUTHUP_CLIENT_ID` (default:
`admin-console`, an Authup built-in client provisioned for every realm). The configured
client **must** register `<ui-origin>/login/callback**` as an allowed redirect URI —
note the trailing `**`. A `<ui-origin>/**` pattern (what `TRUSTED_ORIGINS` generates)
covers it as well.

::: warning Upgrading to Authup >= 1.0.0-beta.63
An **exact** `<ui-origin>/login/callback` registration is no longer sufficient. The
post-login destination now travels in the callback URI's query, and Authup matches a
redirect URI against the full canonical URL **including** its query string
(`isSimpleURLMatch`). A deep-link login against an exactly-registered client is refused
at the authorize step, while a login from the bare login page still succeeds — so the
breakage looks intermittent.

Widen the client's `redirectUri` (a comma-separated glob list, where `*` stays inside a
path segment and `**` matches the rest) to `<ui-origin>/login/callback**` before
upgrading.
:::

::: warning Upgrading from Authup < 1.0.0-beta.59
Authup beta.59 removed the shared `web` system client that used to be provisioned for
every realm ([authup#3379](https://github.com/authup/authup/pull/3379)). Existing `web`
rows survive and keep working, but they no longer track `PUBLIC_URL` / `TRUSTED_ORIGINS`
changes, and realms created after the upgrade get no `web` client at all — which is why
the default moved to `admin-console`.

A deployment serving the UI from its own origin should register a **dedicated** client
(once per realm, e.g. via a wildcard `realms[]` provisioning entry named `"*"`) and point
`NUXT_PUBLIC_AUTHUP_CLIENT_ID` at it, rather than sharing Authup's console client.
:::

## Session cookies

The UI persists its session in cookies at path `/`: `access_token`,
`access_token_expire_date`, `refresh_token`, `id_token`, `realm` and
`realm_management`. Authup's own hosted pages — the authorize/login pages and the
account console — persist **their** session under the *same names*, because both
sides run `@authup/client-web-kit`'s store.

The two stay apart only while their `(name, domain, path)` cookie keys differ. When
they collide, the browser keeps **both** records and sends both; a read takes the
**first**, which is the **older** one. Each side can then hydrate, rotate and
`cleanup()`-revoke the other's tokens. The symptom is being **logged out on the next
page reload** — the login itself succeeds, because everything after the code exchange
is still in memory.

Which deployment layout you run decides what is required:

| Authup is served at | Requirement |
|---|---|
| A path on the UI's own origin (`https://hub.example.com/auth`) | Authup including [authup#3495](https://github.com/authup/authup/issues/3495), which scopes the console cookies to that sub-path. **Unreleased as of `1.0.0-beta.63`** — on beta.63 and earlier this layout is broken. Keep `NUXT_PUBLIC_COOKIE_DOMAIN` empty. |
| A subdomain of the UI host (`auth.hub.example.com`) | `NUXT_PUBLIC_COOKIE_DOMAIN` must be empty, or at least not cover that host. A `Domain` value is delivered to every subdomain of itself, so it reaches Authup's origin and collides there. |
| A separate origin (`auth.example.com`, or any unrelated host) | Nothing. Separate cookie jars. |

**Rule: leave `NUXT_PUBLIC_COOKIE_DOMAIN` empty.** Host-only cookies are correct in all
three layouts. Set it only when a *sibling* host genuinely has to read the cookie
itself, and never to a value that covers Authup's host. The Helm chart refuses that
combination at render time (`flameHub.validateCookieDomain`).

It buys the Hub nothing by default: the services read the bearer token from the
`Authorization` header, and their cookie fallback only ever sees same-origin requests
under a shared hostname.

::: warning Changing `NUXT_PUBLIC_COOKIE_DOMAIN` from a value to empty
The switch does not clear what browsers already hold. The previously written
`Domain`-scoped records survive, they are **older** than the host-only ones written
after the change, and they therefore keep winning the read — so a returning user can
stay broken past the fix.

`access_token` and `access_token_expire_date` carry a `maxAge` and lapse with the
token, but `refresh_token`, `id_token`, `realm` and `realm_management` are session
cookies: they live until the browser is closed. Have affected users close the browser
once, or clear the site's cookies.
:::

## Server Rendering and Hydration

The app runs with `ssr: true`, but nothing fetched during the server render used to reach
the browser. Every detail page issued its request **twice** — once while rendering the
HTML, once again on the hydrating client. Every list was worse: its initial load ran in a
detached microtask that resolved *after* the HTML had already been flushed, so the server
paid for the request and still shipped an empty list, which the client then fetched again.

The handoff runs over **`@authup/client-web-kit`'s hydration store**, provided
automatically by `@authup/client-web-nuxt`'s kit plugin and backed by
`nuxtApp.payload.data` — the same bucket `useAsyncData` transports its results in. Hub
adds no install option and no plugin of its own: `@privateaim/client-vue` calls
`injectHydrationStore()` and no-ops when it returns `undefined`. Under a host that
provides no store the server render does not load at all, rather than rendering rows the
hydrating client has no way to reproduce.

### Lists

`createList` records the initial load under `flame:list:<type>:<useId()>` during the
server render; the hydrating client adopts that snapshot (`data`, `total`, `meta`) and
skips its own load. The entry is consumed on read — a collection goes stale, and it must
not seed a later client-side navigation back to the route.

The key is deliberately **not** derived from the query. A query-derived key has to be
re-derived identically on the client, which makes filter insertion order, a `query` prop
assembled from store state that is not populated yet on one side, and two same-query lists
on one page all load-bearing — and each of them fails silently, as a list that simply
fetches twice again. `useId()` (Vue 3.5) is stable across the server render and the
hydrating client for the same position in the component tree, so agreement is structural
instead of something a caller can get wrong. The entity type is in the key only to bound
the blast radius of an entry that is recorded but never adopted.

That stability has one prerequisite, and it is easy to break by accident: `createList`
registers its `onServerPrefetch` hook on **both** sides of the boundary, not just on the
server. A non-empty `instance.sp` is what makes Vue call `markAsyncBoundary()` after
setup, handing the component's subtree a fresh `useId` counter. Register the hook only
when `isServerRuntime()` — the obvious reading — and the boundary exists only on the
server, so any `useId()` drawn inside or after a list shifts between the two renders: the
second list on a page then derives the key the server used for the *first* one and adopts
the wrong rows, with its own load suppressed so it never corrects. The hook body never
runs on the client — `@vue/server-renderer` is the only thing that invokes `sp` — so
registering it there is free.

Because the list's rows now reach the payload, a **collection query must not request a
permission-gated column**. `fields: ['+accountSecret']` on the registry-projects list was
dropped for exactly this reason: nothing on that page rendered it (the details modal
re-resolves the record by id), and leaving it in would have written every Harbor robot
secret into the served HTML document instead of an XHR response. Keep credential columns
on the record read that displays them.

### Two rules a change here must not break

| Rule | If broken |
|------|-----------|
| Never record a failed or coalesced-away load. | An adopted snapshot suppresses the client's own load, so an empty snapshot strands the list on it with no retry. `createListRaw`'s `loaded` flag enforces it — only a load that ran to completion is recorded. |
| Pass `deep: true` to `useAsyncData`. | Nuxt 4 returns a `shallowRef`, and every detail page updates its entity **per property** (`updateObjectProperties` / `extendObject`). Without it the page silently stops updating after a save. The `useEntityRecord` composable centralises this. |

Never give an authenticated route an `swr` or `isr` route rule — the payload is
per-request (`nuxt.config.ts` declares exactly one route rule, `'/login/callback': { ssr: false }`).

### Consequences

The server render now **waits** for a list's request (`onServerPrefetch`) where it
previously did not, so a list's upstream latency sits on the SSR critical path. The nine
`[id].vue` detail pages already blocked the render this way — they `await` their record in
`setup()` — so this is not a new class of dependency, but a slow Core API now shows up as
time-to-first-byte rather than as a spinner.

List rows now render on the server, which puts `<VCTimeago>` on both sides of the boundary
for the first time. It computes a wall-clock-relative string during `setup()`, so a row
whose age crosses a bucket boundary between the render and the hydration — or plain
client/server clock skew — produces a text mismatch, and Vue reports those through
`console.error` in production builds too. Vue repairs the text, so nothing is
misrendered, but it is a new source of console noise on list pages and it makes a *real*
mismatch harder to spot. Giving `VCTimeago` an SSR-stable first render belongs upstream in
`@vuecs/timeago`; until then, treat a lone timeago mismatch as expected.

Records resolved by `createEntityManager` are **not** handed over yet; those still fetch on
both sides of the boundary. Tracked as a follow-up.

## Account Self-Service

The UI has **no settings area of its own**. Profile, password, authenticators, sessions
and connected applications live in **Authup's account console**, served by Authup's
server-core on the IdP origin as of `v1.0.0-beta.59`. Keeping a second, thinner surface
in the UI would only split the account UX across two origins.

The header's account icon links straight at
`<NUXT_PUBLIC_ACCOUNT_URL>/?ref=<ui-origin>&realmId=<session-realm>`, defaulting to
`<NUXT_PUBLIC_AUTHUP_URL>/account`. It is the only entry point — the sidebar carries no
account entry, so the one link that leaves for the IdP origin sits in one place rather
than two. The console renders the `ref` origin as a back link after validating it
against the trusted app origins; the UI origin is already required to be trusted for the
login callback, so this needs no extra deployment configuration. Set
`NUXT_PUBLIC_ACCOUNT_URL` for deployments where the console is not reachable under
`<NUXT_PUBLIC_AUTHUP_URL>/account`.

`realmId` is a safety net for the session mismatch between the two origins: the UI's
session outlives the IdP's, so the account icon still renders after the IdP session has
expired. The console applies the hint only when it sees an unauthenticated visitor, and
then starts the authorization-code flow against that realm instead of asking which realm
to sign in to — a question the visitor was never asked when signing into the UI. It is
ignored while a console session exists, and while the console carries an `error` param,
so a denied consent cannot loop back into the flow.

## Key Features

- **Project management** — create and manage collaborative research projects
- **Analysis workflows** — define, configure, and monitor distributed analyses
- **Node management** — register and manage compute nodes
- **Administration** — realm management, user roles, approval workflows
- **Real-time updates** — live status via WebSocket (Messenger service)
- **Light / dark mode** — class-based color mode with a header toggle

## Technology

- **Nuxt 4** with SSR
- **Vue 3** composition API
- **Tailwind CSS v4** via **@privateaim/client-vue-theme** — design tokens, light/dark chrome, card system
- **@vuecs/\*** component framework + **Iconify** SVG icons
- **@privateaim/client-vue** — shared component library
- **@privateaim/core-http-kit** — typed HTTP client for Core API
- **Authup client libraries** — authentication and authorization UI

## Icons

The client ships only the icons it actually renders. `@nuxt/icon`'s standalone vite plugin scans
source for `<collection>:<name>` literals at build time and emits just that subset into
`virtual:nuxt-icon-bundle/register`, which `plugins/vuecs.ts` imports. Registration goes through
`addIcon` from `@iconify/vue` — the same global store `<VCIcon>` reads — so components are
unaffected. This replaced registering the full Font Awesome 6 solid + brands collections (1,902
icons, ~429 KB gzip) and cut the client JS payload from ~1,031 KB to ~623 KB gzip.

The scanned paths are configured in `apps/client-ui/icon-bundle.config.ts`. They cover this app,
`@privateaim/client-vue`, `@privateaim/client-vue-theme`, `@authup/client-web-kit` and
`@vuecs/icons-font-awesome` (whose preset holds the vuecs behavioral defaults — pagination arrows,
submit-button, alert and collapse icons — that appear in no hub source file).

Two consequences for anyone adding an icon:

- **Write the icon name as a literal.** A composed name (`` `fa6-brands:${os}` ``) is invisible to
  the scan, so it is never bundled; `@iconify/vue` then falls back to fetching it from the public
  Iconify API at runtime. Resolve to literals instead — see `FAnalysisBuildStep.vue`.
- **A path that stops matching fails silently** — an empty icon slot, not a build error.
  `apps/client-ui/test/unit/icon-bundle.spec.ts` pins one uniquely-attributable icon per scanned
  source to catch that.
