# @privateaim/client-vue

Reusable Vue 3 component library for building PrivateAIM client applications. Provides UI components for managing analyses, projects, nodes, registries, and more.

## Installation

```bash
npm install @privateaim/client-vue
```

### Peer Dependencies

- `vue` ^3.5
- `pinia` — State management
- `bootstrap-vue-next` — Bootstrap components
- `@authup/client-web-kit` — Authup UI components

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
    coreURL: string;            // Core API base URL (required)
    storageURL: string;         // Storage service base URL (required)
    telemetryURL: string;       // Telemetry service base URL (required)
    components?: boolean | string[];  // Register globally (true = all, string[] = selective)
    storeManager?: StoreManagerOptions;
    translatorLocale?: string;  // Locale for translations
    isServer?: boolean;         // SSR mode flag
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

## Dependencies

- `vue` — Vue 3 framework
- `pinia` — State management
- `bootstrap-vue-next` — Bootstrap Vue components
- `@authup/client-web-kit` — Authentication UI
- `@vuecs/list-controls` — List/store management
- `@vuelidate/core` — Form validation
- `@vueuse/core` — Vue composition utilities
- `@privateaim/core-kit` — Domain types
- `@privateaim/core-http-kit` — Core API client
- `@privateaim/storage-kit` — Storage types and client
- `@privateaim/telemetry-kit` — Telemetry types and client
