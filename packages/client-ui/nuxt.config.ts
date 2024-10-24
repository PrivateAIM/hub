/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ModuleOptions } from '@authup/client-web-nuxt';
import path from 'node:path';
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
    experimental: {
        scanPageMeta: false,
    },
    runtimeConfig: {
        authupUrl: process.env.AUTHUP_URL,
        coreUrl: process.env.CORE_URL,
        storageUrl: process.env.STORAGE_URL,

        public: {
            coreUrl: process.env.CORE_URL,
            coreRealtimeTransports: process.env.CORE_REALTIME_TRANSPORTS,
            storageUrl: process.env.STORAGE_URL,
            authupUrl: process.env.AUTHUP_URL,
            cookieDomain: process.env.COOKIE_DOMAIN,
        },
    },
    telemetry: false,
    ssr: true,
    alias: {
        '@privateaim/core-kit': path.join(__dirname, '..', 'core-kit', 'src'),
        '@privateaim/kit': path.join(__dirname, '..', 'kit', 'src'),
        '@privateaim/client-vue': path.join(__dirname, '..', 'client-vue', 'src'),
        '@privateaim/storage-kit': path.join(__dirname, '..', 'storage-kit', 'src'),
    },
    /*
    ** Global CSS
    */
    css: [
        'bootstrap-vue-next/dist/bootstrap-vue-next.css',
        '@vuecs/pagination/dist/index.css',
        '@vuecs/navigation/dist/index.css',
        '@authup/client-web-kit/index.css',
        '@/../client-vue/dist/index.css',
        '@fortawesome/fontawesome-free/css/all.css',
        'bootstrap/dist/css/bootstrap.css',
        '@/assets/css/vue-layout-navigation.css',
        '@/assets/css/vue-form-wizard.css',
        '@/assets/css/root.css',
        '@/assets/css/core/header.css',
        '@/assets/css/core/navbar.css',
        '@/assets/css/core/body.css',
        '@/assets/css/core/sidebar.css',
        '@/assets/css/core/footer.css',
        '@/assets/css/domain.css',
        '@/assets/css/card.css',
        '@/assets/css/colors.css',
        '@/assets/css/form.css',

        '@/assets/css/bootstrap-override.css',
    ],
    /*
    ** Nuxt.js modules
    */
    modules: [
        [
            // ../client-web-nuxt/src/module
            '@authup/client-web-nuxt', {
                apiURLRuntimeKey: 'authupUrl',
                cookieDomainRuntimeKey: 'cookieDomain',
            } satisfies ModuleOptions,
        ],
        [
            '@nuxtjs/google-fonts', {
                families: {
                    Asap: true,
                    Nunito: true,
                },
                download: true,
            },
        ],
    ],
});
