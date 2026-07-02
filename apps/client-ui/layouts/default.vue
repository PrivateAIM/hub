<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">

import { VCAlertDialogProvider, VCToastProvider } from '@vuecs/overlays';
import PageHeader from '../components/layout/header.vue';
import PageSidebar from '../components/layout/sidebar.vue';
import PageFooter from '../components/layout/footer.vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: {
        PageHeader,
        PageSidebar,
        PageFooter,
        VCAlertDialogProvider,
        VCToastProvider,
    },
});
</script>

<template>
    <VCToastProvider>
        <div id="app">
            <PageHeader />
            <div class="page-wrapper">
                <PageSidebar />
                <div class="page-content">
                    <NuxtPage />
                </div>
            </div>
            <PageFooter />
        </div>

        <!--
            Single host for the imperative useAlertDialog() confirmation API
            (e.g. <FEntityDelete>'s delete prompt and the assignment toggles'
            removal prompt). The AlertDialogManager is provided app-wide by
            `app.use(installOverlays)` in plugins/vuecs.ts, so one provider under
            the authenticated shell drains confirmations from every page. Placed
            beside the toaster, not context-scoped like <VCToastProvider>.
        -->
        <VCAlertDialogProvider />
    </VCToastProvider>
</template>
<style>
#__nuxt,
#__layout,
#app {
    height: 100%;
}
</style>
