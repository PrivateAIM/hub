/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ModuleOptions } from '@authup/client-web-nuxt';
import path from 'node:path';
import { defineNuxtConfig } from 'nuxt/config';
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },

    experimental: {
        appManifest: false,
        scanPageMeta: false,
    },

    devtools: { componentInspector: false },

    runtimeConfig: {
        authupUrl: process.env.AUTHUP_URL,
        coreUrl: process.env.CORE_URL,
        storageUrl: process.env.STORAGE_URL,
        telemetryUrl: process.env.TELEMETRY_URL,

        public: {
            authupUrl: process.env.AUTHUP_URL,
            // OAuth2 client the UI uses for the authorization-code (PKCE) login
            // flow. Defaults to the Authup built-in "web" client (CLIENT_WEB_NAME)
            // at the call site; override per deployment when the UI runs on its
            // own origin and uses a dedicated client. The client must register
            // `<ui-origin>/login/callback` as a redirect URI.
            authupClientId: process.env.AUTHUP_CLIENT_ID,
            coreUrl: process.env.CORE_URL,
            storageUrl: process.env.STORAGE_URL,
            telemetryUrl: process.env.TELEMETRY_URL,

            cookieDomain: process.env.COOKIE_DOMAIN,
            version: process.env.npm_package_version,
        },
    },

    telemetry: false,
    ssr: true,

    alias: {
        '@privateaim/core-kit': path.join(import.meta.dirname, '..', '..', 'packages', 'core-kit', 'src'),
        '@privateaim/kit': path.join(import.meta.dirname, '..', '..', 'packages', 'kit', 'src'),
        '@privateaim/client-vue': path.join(import.meta.dirname, '..', '..', 'packages', 'client-vue', 'src'),
        '@privateaim/storage-kit': path.join(import.meta.dirname, '..', '..', 'packages', 'storage-kit', 'src'),
        '@privateaim/telemetry-kit': path.join(import.meta.dirname, '..', '..', 'packages', 'telemetry-kit', 'src'),
    },

    /*
 ** Global CSS
 */
    css: [
        // App-local Tailwind v4 entry — `@import`s @privateaim/client-vue-theme
        // (which transitively pulls in @authup/client-web-kit-theme +
        // tailwindcss + @vuecs/design + @vuecs/theme-tailwind + the authup
        // kit-component styles + every migrated hub chrome stylesheet) and
        // adds `@source` scopes for this app's template tree + the
        // client-vue hyperscript .ts tree + per-app nested vuecs deps. The
        // theme package absorbed all the former local assets/css/* project
        // stylesheets.
        '@/assets/css/tailwind.css',
        '@/../../packages/client-vue/dist/style.css',
        '@/assets/css/fonts.css',
    ],

    /*
 ** Nuxt.js modules
 */
    modules: [
        '@pinia/nuxt',
        [
            // ../client-web-nuxt/src/module
            '@authup/client-web-nuxt', 
{
    apiURLRuntimeKey: 'authupUrl',
    cookieDomainRuntimeKey: 'cookieDomain',
} satisfies ModuleOptions,
        ],
        [
            '@nuxtjs/google-fonts',
            {
                families: {
                    Asap: [400, 700],
                    Nunito: [400, 700],
                },
                download: true,
            },
        ],
        '@vuecs/nuxt',
    ],

    // @vuecs/nuxt — only wire color-mode persistence here. Theme
    // registration + per-package plugins stay in plugins/vuecs.ts
    // (which handles installForms / installTable / etc. + defaults).
    // `themes: []` prevents the module from auto-installing a duplicate
    // theme manager. `injectTokens: false` — @vuecs/design is already
    // pulled in via @privateaim/client-vue-theme's CSS @import chain.
    vuecs: {
        injectTokens: false,
        themes: [],
        colorMode: { value: 'system' },
        colorPalette: false,
    },

    compatibilityDate: '2025-01-21',
});
