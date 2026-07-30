# @privateaim/client-vue

Reusable Vue 3 component library for building PrivateAIM client applications. Provides UI components for managing analyses, projects, nodes, registries, and more.

Components are built on the `@vuecs/*` component family and styled through Tailwind CSS v4 utility classes — consuming applications must load the [`@privateaim/client-vue-theme`](./client-vue-theme.md) stylesheet (or provide an equivalent Tailwind v4 theme) for the components to render styled.

## Installation

```bash
npm install @privateaim/client-vue
```

### Peer Dependencies

The library expects the consuming application to provide:

- `vue` ^3.5
- `@authup/client-web-kit` — Authup UI components
- `@vuecs/*` — component framework (`forms`, `list`, `table`, `pagination`, `overlays`, `icon`, `button`, `elements`, `link`, `timeago`, `countdown`, …)
- `validup` + `@validup/vue` + `@validup/zod` — form validation
- `ilingo` + `@ilingo/vue` + `@ilingo/validup` — translations
- `@privateaim/core-kit`, `@privateaim/core-http-kit`, `@privateaim/storage-kit`, `@privateaim/telemetry-kit` — domain types and HTTP clients

## Usage

### Plugin Registration

```typescript
import { install } from '@privateaim/client-vue';
import { createApp } from 'vue';

const app = createApp(App);

app.use({ install }, {
    coreURL: 'http://localhost:3000/core/',
    storageURL: 'http://localhost:3000/storage/',
    telemetryURL: 'http://localhost:3000/telemetry/',
    components: true,           // register all components globally
    translatorLocale: 'en',
});
```

### Plugin Options

```typescript
type Options = {
    coreURL: string,            // Core API base URL (required)
    storageURL: string,         // Storage service base URL (required)
    telemetryURL: string,       // Telemetry service base URL (required)
    components?: boolean | string[],  // Register globally (true = all, string[] = selective)
    translatorLocale?: string,  // Locale for translations
    isServer?: boolean,         // SSR mode flag
};
```

The plugin installs HTTP clients for the core, storage, and telemetry services, a socket manager for real-time updates, and a translator instance.

### Components

Components can be imported individually:

```vue
<script setup>
import {
    FAnalysisList,
    FProjectForm,
    FNodeList,
    FRegistryList,
    FMasterImagePicker,
    FEntityDelete,
    FProcessStatus,
} from '@privateaim/client-vue';
</script>
```

### Available Components

| Area | Components |
|------|------------|
| Analysis | list, form, details, node assignment, permissions, logs, bucket files |
| Project | list, form, node management |
| Node | list, details |
| Registry | list, form, project management |
| Master Image | list, picker, group management |
| Bucket File | list, upload, stream |
| Event / Log | list, details |
| Utility | `FEntityDelete`, `FProcessStatus`, login form |

### Composables

```typescript
import {
    injectCoreHTTPClient,
    injectStorageHTTPClient,
    injectTelemetryHTTPClient,
    injectSocketManager,
    useTranslator,
} from '@privateaim/client-vue';

// Inside a setup function. The injected values are typed as the CONTRACTS —
// ICoreClient / IStorageClient / ITelemetryClient — not the concrete classes,
// so a test can supply a fake without any cast.
const coreClient = injectCoreHTTPClient();       // ICoreClient
const storageClient = injectStorageHTTPClient(); // IStorageClient
```

### Install Options

```typescript
import { install } from '@privateaim/client-vue';

app.use(install, {
    coreURL: 'http://localhost:4000',
    storageURL: 'http://localhost:4001',
    telemetryURL: 'http://localhost:4002',

    // Opt-in: installs the realtime socket manager. It needs a live authup
    // store and opens a websocket, so it stays OFF unless requested.
    realtime: true,
});
```

| Option | Purpose |
|--------|---------|
| `coreURL` / `storageURL` / `telemetryURL` | Base URLs used to construct the clients |
| `coreHTTPClient` / `storageHTTPClient` / `telemetryHTTPClient` | Pre-built clients used INSTEAD of constructing from the URLs |
| `pinia` | Pinia instance backing authup's store; required outside Nuxt, and forwarded to the socket manager |
| `realtime` | Install the socket manager (default off) |
| `components` | Register components globally (`true`, or a name allow-list) |
| `translatorLocale` | Initial locale |

::: warning The install is not self-sufficient
`@authup/client-web-kit`'s auth hook and store must already be provided on the
same app — `setupBaseHTTPClient` calls `injectHTTPClientAuthenticationHook(app)`
and the permission-check composables call `injectStore()`. Installing only
client-vue throws.
:::

### Testing with a fake client

Pass a `FakeClient` through the `*HTTPClient` options rather than pre-providing
it: each installer early-returns on `isXHTTPClientUsable(app)` and authup's
`provide()` is first-wins, so an ordering mistake fails *silently*, with the
real client winning.

```typescript
import { createFakeClient } from '@privateaim/core-http-kit/testing';

const coreHTTPClient = createFakeClient({
    handlers: { 'DELETE /projects/:id': () => ({ data: {}, meta: {} }) },
});

app.use(install, { coreURL, storageURL, telemetryURL, coreHTTPClient });

// …then assert against what the component actually dispatched
expect(coreHTTPClient.requests[0]).toMatchObject({ method: 'DELETE', params: { id: 'abc' } });
```

### Working with Response Envelopes

Every single-record call on the injected clients resolves to the `{ data, meta }` record envelope
(see [API Reference](/guide/development/api#response-shapes)). Destructure `data` at the call site —
handing the envelope onward is the failure mode, because a component `emit` or a `Ref<Record>`
accepts it without complaint and the consuming panel then renders blank:

```typescript
// Correct
const { data: node } = await coreClient.node.getOne(nodeId);

// Wrong — `node` is { data, meta }, not the record
const node = await coreClient.node.getOne(nodeId);
```

Entity managers unwrap for you: `createEntityManager(...)` exposes the **bare** record on
`manager.data`, and the `created` / `updated` / `deleted` callbacks (and the matching component
emits) receive the bare record too. Collections are unchanged — `getMany` was always enveloped, and
list handlers keep receiving `{ data, meta }`.

## Technology

- `vue` — Vue 3 framework (composition API)
- `@vuecs/*` — component framework (forms, lists, tables, pagination, overlays, icons)
- `@vuecs/icon` + Iconify — SVG icons (`fa6-solid` / `fa6-brands` collections; no webfont)
- `validup` / `@validup/vue` / `@validup/zod` — form validation wired to the core-kit Zod validators
- `ilingo` / `@ilingo/vue` — translations
- `@authup/client-web-kit` — authentication UI
- `@vueuse/core` — Vue composition utilities
- `@privateaim/core-kit` — domain types
- `@privateaim/core-http-kit` — Core API client
- `@privateaim/storage-kit` — storage types and client
- `@privateaim/telemetry-kit` — telemetry types and client
