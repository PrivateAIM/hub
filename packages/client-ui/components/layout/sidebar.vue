<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs } from '@authup/client-web-kit';
import { VCCountdown } from '@vuecs/countdown';
import { VCNavItems } from '@vuecs/navigation';
import { defineNuxtComponent } from '#app';
import { computed } from '#imports';

export default defineNuxtComponent({
    components: { VCCountdown, VCNavItems },
    setup() {
        const store = injectStore();

        const { loggedIn, accessTokenExpireDate: tokenExpireDate, realmManagement } = storeToRefs(store);

        const tokenExpiresIn = computed(() => {
            if (!tokenExpireDate.value) {
                return 0;
            }

            return tokenExpireDate.value.getTime() - Date.now();
        });

        return {
            loggedIn,
            tokenExpiresIn,
            realmManagement,
        };
    },
});
</script>
<template>
    <div class="page-sidebar">
        <VCNavItems
            class="sidebar-menu navbar-nav"
            :level="1"
        />

        <div class="mt-auto">
            <div
                v-if="loggedIn"
                class="font-weight-light d-flex flex-column ms-3 me-3 mb-1 mt-auto"
            >
                <small class="countdown-text">
                    <VCCountdown
                        :time="tokenExpiresIn"
                    >
                        <template #default="props">
                            <i class="fa fa-clock pe-1" /> The session will be renewed in
                            <span class="text-success">
                                {{ props.minutes }} minute(s), {{ props.seconds }} second(s)
                            </span>
                        </template>
                    </VCCountdown>
                </small>
            </div>

            <!--
            <ul class="sidebar-menu vc-nav-items navbar-nav">
                <li class="vc-nav-item">
                    <a
                        class="vc-nav-link"
                        :href="'javascript:void(0)'"
                        target="_blank"
                    >
                        <i class="fa fa-file" /> <span class="vc-nav-link-text">Documentation</span>
                    </a>
                </li>
            </ul>
            -->
        </div>
    </div>
</template>
<style scoped>
.countdown-text {
    color: #aeb2b7;
}
</style>
