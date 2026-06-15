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

// Inside a setup function
const coreClient = injectCoreHTTPClient();
const storageClient = injectStorageHTTPClient();
```

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
