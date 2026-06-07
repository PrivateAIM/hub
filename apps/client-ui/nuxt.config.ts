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
        // tailwindcss + @vuecs/design + @vuecs/theme-tailwind + every
        // migrated hub chrome stylesheet) and adds `@source` scopes for
        // this app's template tree + the client-vue hyperscript .ts tree
        // + per-app nested vuecs deps. The theme package absorbed all the
        // former local assets/css/* project stylesheets.
        '@/assets/css/tailwind.css',
        '@authup/client-web-kit/dist/style.css',
        '@/../../packages/client-vue/dist/style.css',
        '@fortawesome/fontawesome-free/css/all.css',
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
    ],
    compatibilityDate: '2025-01-21',
});
