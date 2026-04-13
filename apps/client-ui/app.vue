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
            link: [],
        });
    },
});
</script>
<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
