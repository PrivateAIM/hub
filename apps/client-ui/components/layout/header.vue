<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs } from '@authup/client-web-kit';
import { FDisplayName } from '@privateaim/client-vue';
import { VCGravatar } from '@vuecs/gravatar';
import { VCNavItems } from '@vuecs/navigation';
import { ref, useColorMode } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutTopNavigationRegistryId, Navigation } from '../../config/layout';
import Logo from '../svg/Logo';

export default defineNuxtComponent({
    components: {
        FDisplayName,
        Logo,
        VCGravatar,
        VCNavItems,
    },
    setup() {
        const store = injectStore();
        const {
            loggedIn,
            user,
        } = storeToRefs(store);

        const displayNav = ref(false);

        const toggleNav = () => {
            displayNav.value = !displayNav.value;
        };

        // Top nav is permission-filtered — pass the resolver as `:data` to
        // `<VCNavItems>`. The reactive session reads happen after an `await`
        // inside the resolver, so the explicit `:watch` list re-runs it on
        // every session transition (login/logout, identity change).
        const navigation = new Navigation(store);
        const topItems = () => navigation.getTopItems();
        const topItemsWatch = [
            () => store.loggedIn,
            () => store.userId,
            () => store.realmManagement,
        ];

        const { isDark } = useColorMode();
        const toggleColorMode = () => {
            isDark.value = !isDark.value;
        };

        return {
            loggedIn,
            user,
            toggleNav,
            displayNav,
            topItems,
            topItemsWatch,
            topRegistryId: LayoutTopNavigationRegistryId,
            isDark,
            toggleColorMode,
        };
    },
});
</script>
<template>
    <div>
        <header class="page-header fixed-top">
            <div class="header-title">
                <div class="toggle-box">
                    <button
                        type="button"
                        class="toggle-trigger"
                        @click="toggleNav"
                    >
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar" />
                        <span class="icon-bar" />
                        <span class="icon-bar" />
                    </button>
                </div>
                <div class="logo">
                    <Logo :height="32" />
                    <div class="logo-text">
                        <span>H</span>U<span>B</span>
                    </div>
                </div>
            </div>
            <nav class="page-navbar navbar-expand-md">
                <div
                    id="page-navbar"
                    class="navbar-content navbar-collapse"
                    :class="{'show': displayNav}"
                >
                    <VCNavItems
                        class="navbar-nav"
                        :data="topItems"
                        :watch="topItemsWatch"
                        registry
                        :registry-id="topRegistryId"
                    />
                    <ul class="navbar-nav vc-nav-items navbar-gadgets">
                        <li class="vc-nav-item">
                            <button
                                type="button"
                                class="vc-nav-link"
                                :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                                :aria-pressed="isDark ? 'true' : 'false'"
                                @click.prevent="toggleColorMode"
                            >
                                <VCIcon :name="isDark ? 'fa6-solid:sun' : 'fa6-solid:moon'" />
                            </button>
                        </li>
                        <template v-if="loggedIn && user">
                            <li class="vc-nav-item">
                                <nuxt-link
                                    class="vc-nav-link user-link"
                                    :to="'/users/'+user.id"
                                >
                                    <VCGravatar :email="user.email ? user.email : ''" />
                                    <span>
                                        <FDisplayName
                                            :name="user.name"
                                            :display-name="user.display_name"
                                        />
                                    </span>
                                </nuxt-link>
                            </li>
                            <li class="vc-nav-item">
                                <nuxt-link
                                    :to="'/settings'"
                                    class="vc-nav-link"
                                >
                                    <VCIcon name="fa6-solid:gear" />
                                </nuxt-link>
                            </li>
                            <li class="vc-nav-item">
                                <nuxt-link
                                    :to="'/logout'"
                                    class="vc-nav-link"
                                >
                                    <VCIcon name="fa6-solid:power-off" />
                                </nuxt-link>
                            </li>
                        </template>
                    </ul>
                </div>
            </nav>
        </header>
    </div>
</template>
