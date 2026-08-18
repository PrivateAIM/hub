<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script>
import { defineNuxtComponent, useHead } from '#app';

export default defineNuxtComponent({
    setup() {
        useHead({
            charset: 'utf-8',
            titleTemplate: 'PrivateAim - HUB',
            meta: [],
            link: [
                /*
                 * The flame mark. Browsers that support SVG icons take this one
                 * (crisp at every size); the rest fall back to the /favicon.ico
                 * link Nuxt injects by default.
                 */
                {
                    rel: 'icon',
                    type: 'image/svg+xml',
                    href: '/favicon.svg',
                },
            ],
        });
    },
});
</script>
<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
