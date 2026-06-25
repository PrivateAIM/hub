<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs } from '@authup/client-web-kit';
import { VCCountdown } from '@vuecs/countdown';
import { VCIcon } from '@vuecs/icon';
import type { NavigationResolverContext } from '@vuecs/navigation';
import { VCNavItems } from '@vuecs/navigation';
import { defineNuxtComponent } from '#app';
import { computed } from '#imports';
import { LayoutTopNavigationRegistryId, Navigation } from '../../config/layout';

export default defineNuxtComponent({
    components: {
        VCCountdown, 
        VCIcon, 
        VCNavItems, 
    },
    setup() {
        const store = injectStore();

        const {
            loggedIn,
            accessTokenExpireDate: tokenExpireDate,
            realmManagement,
        } = storeToRefs(store);

        const tokenExpiresIn = computed(() => {
            if (!tokenExpireDate.value) {
                return 0;
            }

            return tokenExpireDate.value.getTime() - Date.now();
        });

        // Sidebar items are permission-filtered and additionally vary by the
        // active top-level section. The header's top `<VCNavItems registry>`
        // publishes its active trail to the shared navigation registry; this
        // resolver reads that section's name (synchronously, so the nav tracks
        // it as a reactive dep) and re-renders whenever it changes — i.e. on a
        // click of the url-less "Admin"/"Home" tab or on navigation across the
        // `/admin` boundary. The `:watch` list covers session transitions read
        // only after the first `await` inside the resolver.
        const navigation = new Navigation(store);
        const sideItems = (ctx: NavigationResolverContext) => {
            const activeTopName = ctx.registry(LayoutTopNavigationRegistryId)
                .activeTrail.value[0]?.name;

            return navigation.getSideItems(activeTopName);
        };
        const sideItemsWatch = [
            () => store.loggedIn,
            () => store.userId,
            () => store.realmManagement,
        ];

        return {
            loggedIn,
            tokenExpiresIn,
            realmManagement,
            sideItems,
            sideItemsWatch,
        };
    },
});
</script>
<template>
    <div class="page-sidebar">
        <div
            v-if="realmManagement"
            class="sidebar-header"
        >
            <div class="text-center">
                {{ realmManagement.name }}
            </div>
        </div>

        <VCNavItems
            class="sidebar-menu flex flex-col list-none"
            :data="sideItems"
            :watch="sideItemsWatch"
        />

        <div class="mt-auto">
            <div
                v-if="loggedIn"
                class="font-light flex flex-col ms-3 me-3 mb-1 mt-auto"
            >
                <small class="countdown-text">
                    <VCCountdown
                        :time="tokenExpiresIn"
                    >
                        <template #default="props">
                            <VCIcon
                                name="fa6-solid:clock"
                                class="pe-1"
                            /> The session will be renewed in
                            <span class="text-success-600">
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
                        <VCIcon name="fa6-solid:file" /> <span class="vc-nav-link-text">Documentation</span>
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
