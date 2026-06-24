<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { defineNuxtComponent, navigateTo } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey } from '../../config/layout';

export default defineNuxtComponent({
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            layout: 'auth',
        });

        // The global routing interceptor (@authup/client-web-nuxt) exchanges
        // the authorization code and, when an in-app target was stored,
        // redirects there. Reaching this component means the exchange
        // succeeded without a stored target.
        await navigateTo({ path: '/' });
    },
});
</script>
<template>
    <div class="login-callback">
        <span class="fa-solid fa-spinner fa-spin" />
    </div>
</template>
<style scoped>
.login-callback {
    position: relative;
    z-index: 1;
    text-align: center;
    font-size: 1.5rem;
    color: var(--vc-color-fg-muted, #9aa6bd);
}
</style>
