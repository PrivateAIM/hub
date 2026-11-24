<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/client-vue 🎨</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/client-vue)](https://www.npmjs.com/package/@privateaim/client-vue)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Vue 3 components for FLAME Hub: lists, forms and detail views for analyses, projects, nodes, registries and files.**

One plugin install provides the core, storage and telemetry HTTP clients, the realtime socket and the translator, and every
component resolves, renders and updates its entity through them. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub)
monorepo, built with [vuecs](https://github.com/tada5hi/vuecs).

[Installation](#installation) · [Setup](#setup) · [Components](#components) · [Clients and entity managers](#clients-and-entity-managers) · [Analysis file access](#analysis-file-access) · [Testing with a fake client](#testing-with-a-fake-client) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/frontend/client-vue.html)

---

## Installation

```bash
npm install @privateaim/client-vue
```

The package ships ESM only and needs Node.js `>=26.0.0` to build. Everything it renders with is a peer dependency, so your
application provides:

- `vue`, `vue-router`, `pinia`
- `@authup/client-web-kit` (with `@authup/core-kit`, `@authup/core-http-kit`, `@authup/core-realtime-kit`, `@authup/i18n`)
- the `@vuecs/*` components (`core`, `button`, `elements`, `forms`, `icon`, `list`, `table`, `pagination`, `overlays`, `link`,
  `placeholder`, `timeago`, `countdown`, `icons-font-awesome`)
- `validup`, `@validup/vue`, `@validup/zod`, `zod`, and `ilingo`, `@ilingo/vue`, `@ilingo/validup`, `@ilingo/validup-vue`
- `@privateaim/kit`, `@privateaim/core-kit`, `@privateaim/core-http-kit`, `@privateaim/storage-kit`, `@privateaim/telemetry-kit`
- `@rapiq/core`, `@rapiq/adapter-memory`, `hapic`, `socket.io-client`, `@vueuse/core`, `smob`

The components are styled with Tailwind CSS v4 utility classes and vuecs themes. Load
[`@privateaim/client-vue-theme`](https://www.npmjs.com/package/@privateaim/client-vue-theme) (or an equivalent Tailwind v4 theme)
and the package's own stylesheet, `@privateaim/client-vue/dist/style.css`.

## Setup

```typescript
import { install as installAuthup } from '@authup/client-web-kit';
import { install } from '@privateaim/client-vue';
import vuecs from '@vuecs/core';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import '@privateaim/client-vue/dist/style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(vuecs); // pass { themes: [...] } here, see @privateaim/client-vue-theme
app.use(installAuthup, { baseURL: 'https://auth.example.org', pinia });

app.use(install, {
    coreURL: 'https://hub.example.org/core/',
    storageURL: 'https://hub.example.org/storage/',
    telemetryURL: 'https://hub.example.org/telemetry/',
    httpTimeout: 30_000,
    pinia,

    // Opt-in: the realtime socket manager needs a live authup store and opens a
    // websocket, so it stays off unless requested.
    realtime: true,
});
```

`install` is **not** self-sufficient: `@authup/client-web-kit`'s authentication hook and store must already be provided on the
same app. The HTTP clients attach Authup's authentication hook, and the permission checks read Authup's store; installing only
client-vue throws. The package's default export is the same installer as a plugin object (`app.use(clientVue, options)`).

| Option | Type | Default | Description |
|---|---|---|---|
| `coreURL` / `storageURL` / `telemetryURL` | `string` | (required) | Base URLs of the clients the plugin builds |
| `httpTimeout` | `number` | none | Request timeout in milliseconds of those clients. Without it, a hung service stalls an SSR render. Streams and uploads opt out per call |
| `coreHTTPClient` / `storageHTTPClient` / `telemetryHTTPClient` | `ICoreClient` / `IStorageClient` / `ITelemetryClient` | none | Pre-built clients, used instead of constructing one from the matching URL |
| `pinia` | `Pinia` | none | Pinia instance backing Authup's store, forwarded to the socket manager. Required outside Nuxt |
| `realtime` | `boolean` | `false` | Install the realtime socket manager on `coreURL` |
| `components` | `boolean \| string[]` | `false` | Register components globally: `true` for all, or a list of names |
| `translatorLocale` | `string` | none | Initial locale of the translator |

## Components

Import components where you use them, or register them globally with the `components` option:

```vue
<script setup lang="ts">
import { FAnalyses, FEntityDelete, FProjectForm } from '@privateaim/client-vue';
</script>
```

| Area | Components |
|---|---|
| Analysis | `FAnalyses`, `FAnalysis`, `FAnalysisBasicForm`, `FAnalysisSteps`, `FAnalysisStatus`, `FAnalysisStageRail`, `FAnalysisProgressBar`, `FAnalysisMasterImagePicker`, `FAnalysisImageCommand`, `FAnalysisLogs` |
| Analysis nodes | `FAnalysisNodes`, `FAnalysisNodesManager`, `FAnalysisNodeInCard`, `FAnalysisNodeLane`, `FAnalysisNodeDistribution`, `FAnalysisNodeExecutionList`, `FAnalysisNodeAssignAction`, `FAnalysisNodeApprovalCommand`, `FAnalysisNodeLogs` |
| Analysis files | `FAnalysisBucket`, `FAnalysisBucketFile`, `FAnalysisBucketFiles`, `FAnalysisBucketDownload`, `FBucketFiles`, `FBucketFilesManager` |
| Project | `FProjects`, `FProject`, `FProjectForm`, `FProjectCreator`, `FProjectItemCard`, `FProjectNodes`, `FProjectNodeInCard`, `FProjectNodeAssignAction`, `FProjectNodeApprovalCommand` |
| Node | `FNodes`, `FNodeForm`, `FNodeCrypto`, `FNodeClientCredentials`, `FNodeRegistryConnection`, `FNodeRegistryCredentials`, `FNodeRegistryProject` |
| Registry | `RegistryList`, `RegistryForm`, `RegistrySetup`, `RegistryCleanup`, `RegistryProjectList`, `RegistryProjectDetails`, `RegistryProjectForm` |
| Master image | `FMasterImages`, `FMasterImage`, `FMasterImageCard`, `FMasterImagePicker`, `FMasterImageCommand`, `MasterImageGroupList` |
| Event and log | `FEvents`, `FEvent`, `FEventActor`, `FEventRef`, `FEventExpiring`, `FLogs`, `FLog`, `FLogsRefresh` |
| Utility | `FEntityDelete`, `FProcessStatus`, `FDisplayName`, `FContentAction`, `FProgressBar`, `FTranslation`, `FItemToggle`, `LoginForm` |

The registry, master-image-group and login components are exported without the `F` prefix; `components: true` registers every
component under its export name.

### FContentAction

`FContentAction` is the primary action of a collection section, rendered at the right of the section's title row. It is
route-aware: `+ Add` on `overviewUrl`, `← Back` on `addUrl`, and nothing on any other route. A section mounts a single instance
whatever route is active, and a sibling list route (an approval queue, for example) renders no action instead of inheriting a
create action.

```vue
<FContentAction
    overview-url="/admin/clients"
    add-url="/admin/clients/add"
    :add-disabled="!canCreate"
/>
```

`addDisabled` carries the create permission: `VCButton` blocks activation of a disabled link target, so it cannot navigate into
a page the actor would be rejected from.

## Clients and entity managers

Inside a component's `setup`, inject the clients the plugin installed. They are typed as the contracts (`ICoreClient`,
`IStorageClient`, `ITelemetryClient`), not the concrete classes, so a test can supply a fake without a cast.

```typescript
import { injectCoreHTTPClient, injectStorageHTTPClient } from '@privateaim/client-vue';

const coreClient = injectCoreHTTPClient();
const storageClient = injectStorageHTTPClient();

const { data: node } = await coreClient.node.getOne(nodeId);
```

Every single-record call resolves to the `{ data, meta }` record envelope; destructure `data` at the call site. Handing the
envelope onward is the failure mode: a component `emit` or a `Ref<Node>` accepts it without complaint and the consuming panel
renders blank. Collections (`getMany`) are enveloped too, and list handlers receive `{ data, meta }`.

`createEntityManager({ type, props, setup, socket })` is what the entity components build on. It resolves a record by id or
query, exposes the **bare** record on `manager.data`, and calls `created` / `updated` / `deleted` (and emits the matching
component events) with the bare record. With `socket` it subscribes to realtime updates of that record.

Other injection helpers: `injectTelemetryHTTPClient`, `injectSocketManager`, and the `provide*` / `is*Usable` pairs for each.

## Analysis file access

`FBucketFilesManager` requires an `analysisId` and the bucket's `entityId`. It provides a scoped storage client to its subtree
that authorizes each request with a cached [storage capability token](https://hub.docs.privateaim.net/reference/core/#storage-capability-tokens),
minted through the core API: `GET` requests read, `POST` writes and `DELETE` deletes. A refused token is dropped from the
cache. Downloads mint a fresh 60 second token per click and pass it as `?dt=` to the stream route, because a navigation cannot
carry an `Authorization` header.

## Testing with a fake client

Pass a `FakeClient` from the kits' `./testing` entries through the `*HTTPClient` options:

```typescript
import { createFakeClient } from '@privateaim/core-http-kit/testing';

const coreHTTPClient = createFakeClient({
    handlers: { 'DELETE /projects/:id': () => ({ data: {}, meta: {} }) },
});

app.use(install, { coreURL, storageURL, telemetryURL, coreHTTPClient });

// ...mount the component and trigger the delete, then assert what it dispatched
expect(coreHTTPClient.requests[0]).toMatchObject({ method: 'DELETE', params: { id: 'abc' } });
```

Prefer the option over providing a client yourself: each installer returns early when a client is already provided, and
Authup's `provide()` keeps the first value, so an ordering mistake fails silently with the real client winning. Install Pinia,
`@vuecs/core` and `@authup/client-web-kit` before client-vue, as in [Setup](#setup).

## Notes

- **Realtime is opt-in.** Without `realtime: true` no socket manager is installed and entity components receive no live
  updates.
- **`httpTimeout` applies only to clients the plugin builds.** A client passed through `coreHTTPClient` and the like keeps its
  own settings.
- **Icon names are literals.** Components use `@vuecs/icon` with Iconify names (`fa6-solid:...`, `fa6-brands:...`). An app that
  bundles only the icons a build-time scan finds needs every name written out; a composed name such as
  `` `fa6-brands:${os}` `` is never bundled.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
