import{_ as e,o as a,c as n,ae as t}from"./chunks/framework.Czhw_PXq.js";const h=JSON.parse('{"title":"Repository Structure","description":"","frontmatter":{},"headers":[],"relativePath":"guide/development/repository-structure.md","filePath":"guide/development/repository-structure.md"}'),i={name:"guide/development/repository-structure.md"};function p(r,s,l,o,c,d){return a(),n("div",null,[...s[0]||(s[0]=[t(`<h1 id="repository-structure" tabindex="-1">Repository Structure <a class="header-anchor" href="#repository-structure" aria-label="Permalink to &quot;Repository Structure&quot;">​</a></h1><p>PrivateAIM Hub is an npm workspaces monorepo with two workspace roots: <code>apps/*</code> and <code>packages/*</code>. Nx orchestrates build, test, and lint with dependency-aware caching.</p><h2 id="layout" tabindex="-1">Layout <a class="header-anchor" href="#layout" aria-label="Permalink to &quot;Layout&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>hub/</span></span>
<span class="line"><span>├── apps/                  # Runnable services and frontend</span></span>
<span class="line"><span>│   ├── client-ui/         # Nuxt 4 SSR web application</span></span>
<span class="line"><span>│   ├── server-core/       # Main REST API</span></span>
<span class="line"><span>│   ├── server-core-worker/# Background worker (Docker execution)</span></span>
<span class="line"><span>│   ├── server-messenger/  # Real-time messaging (Socket.io)</span></span>
<span class="line"><span>│   ├── server-storage/    # File/object storage (MinIO/S3)</span></span>
<span class="line"><span>│   └── server-telemetry/  # Log aggregation (VictoriaLogs)</span></span>
<span class="line"><span>├── packages/              # Shared libraries</span></span>
<span class="line"><span>│   ├── kit/               # Core utilities: crypto, events, permissions</span></span>
<span class="line"><span>│   ├── core-kit/          # Domain models &amp; types for core service</span></span>
<span class="line"><span>│   ├── core-http-kit/     # HTTP client for the core API</span></span>
<span class="line"><span>│   ├── core-realtime-kit/ # WebSocket event types</span></span>
<span class="line"><span>│   ├── storage-kit/       # Storage domain types</span></span>
<span class="line"><span>│   ├── telemetry-kit/     # Telemetry/logging types</span></span>
<span class="line"><span>│   ├── messenger-kit/     # Messenger domain types</span></span>
<span class="line"><span>│   ├── client-vue/        # Reusable Vue 3 component library</span></span>
<span class="line"><span>│   ├── server-kit/        # Logging, auth, AMQP, Redis helpers</span></span>
<span class="line"><span>│   ├── server-db-kit/     # TypeORM utilities and setup</span></span>
<span class="line"><span>│   ├── server-http-kit/   # HTTP route/controller decorators</span></span>
<span class="line"><span>│   ├── server-realtime-kit/   # Socket.io server helpers</span></span>
<span class="line"><span>│   ├── server-telemetry-kit/  # Telemetry utilities</span></span>
<span class="line"><span>│   ├── server-core-worker-kit/# Worker task definitions</span></span>
<span class="line"><span>│   └── server-storage-kit/    # Storage service contracts</span></span>
<span class="line"><span>└── docs/                  # Documentation (VitePress)</span></span></code></pre></div><h2 id="dependency-layers" tabindex="-1">Dependency Layers <a class="header-anchor" href="#dependency-layers" aria-label="Permalink to &quot;Dependency Layers&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Layer 0 (leaf):   kit, core-kit, storage-kit, telemetry-kit, messenger-kit</span></span>
<span class="line"><span>                     │</span></span>
<span class="line"><span>Layer 1:          core-http-kit, core-realtime-kit, server-kit</span></span>
<span class="line"><span>                     │</span></span>
<span class="line"><span>Layer 2:          server-db-kit, server-http-kit, server-realtime-kit</span></span>
<span class="line"><span>                  server-storage-kit, server-telemetry-kit, server-core-worker-kit</span></span>
<span class="line"><span>                  client-vue</span></span>
<span class="line"><span>                     │</span></span>
<span class="line"><span>Layer 3 (apps):   server-core, server-core-worker, server-storage,</span></span>
<span class="line"><span>                  server-telemetry, server-messenger, client-ui</span></span></code></pre></div><p>Build order follows this DAG. Changes to a leaf kit (e.g., <code>core-kit</code>) require rebuilding all packages that depend on it.</p><h2 id="service-directory-layout" tabindex="-1">Service Directory Layout <a class="header-anchor" href="#service-directory-layout" aria-label="Permalink to &quot;Service Directory Layout&quot;">​</a></h2><p>Each service follows a hexagonal architecture:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>apps/&lt;service&gt;/src/</span></span>
<span class="line"><span>├── core/          # Domain logic (pure business rules)</span></span>
<span class="line"><span>├── adapters/      # External system implementations (database, HTTP, socket)</span></span>
<span class="line"><span>└── app/           # Orchestration (DI modules, wiring, factory)</span></span></code></pre></div><p>See <a href="/getting-started/architecture.html">Architecture</a> for details on each layer.</p><h2 id="library-directory-layout" tabindex="-1">Library Directory Layout <a class="header-anchor" href="#library-directory-layout" aria-label="Permalink to &quot;Library Directory Layout&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>packages/&lt;kit&gt;/</span></span>
<span class="line"><span>├── src/</span></span>
<span class="line"><span>│   ├── domains/       # Domain type definitions per entity</span></span>
<span class="line"><span>│   │   └── &lt;entity&gt;/</span></span>
<span class="line"><span>│   │       ├── constants.ts</span></span>
<span class="line"><span>│   │       ├── types.ts</span></span>
<span class="line"><span>│   │       └── validator.ts</span></span>
<span class="line"><span>│   └── index.ts       # Re-exports</span></span>
<span class="line"><span>├── tsdown.config.ts   # Builds to dist/index.mjs</span></span>
<span class="line"><span>└── package.json</span></span></code></pre></div><h2 id="build-system" tabindex="-1">Build System <a class="header-anchor" href="#build-system" aria-label="Permalink to &quot;Build System&quot;">​</a></h2><ul><li><strong>Libraries</strong>: built with tsdown — ESM only (<code>dist/index.mjs</code>) with TypeScript declarations</li><li><strong>Services</strong>: built with tsdown (JS) + tsc (declarations), preserving directory structure</li><li><strong>Nx</strong>: orchestrates cross-package build ordering via <code>dependsOn: [&quot;^build&quot;]</code></li></ul><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # Build everything (npx nx run-many -t build)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> test</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          # Test everything (npx nx run-many -t test)</span></span></code></pre></div>`,16)])])}const g=e(i,[["render",p]]);export{h as __pageData,g as default};
