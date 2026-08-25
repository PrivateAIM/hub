<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { StoreAuthStatus, injectStore, storeToRefs } from '@authup/client-web-kit';
import { FDisplayName } from '@privateaim/client-vue';
import { VCGravatar } from '@vuecs/gravatar';
import { VCIcon } from '@vuecs/icon';
import { VCNavItems } from '@vuecs/navigation';
import { computed, ref, useColorMode } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutTopNavigationRegistryId, Navigation } from '../../config/layout';
import { useAccountConsoleURL } from '../../core';
import Logo from '../svg/Logo';

export default defineNuxtComponent({
    components: {
        FDisplayName,
        Logo,
        VCGravatar,
        VCIcon,
        VCNavItems,
    },
    setup() {
        const store = injectStore();
        const {
            realmId,
            status,
            user,
        } = storeToRefs(store);

        const authenticated = computed(() => status.value === StoreAuthStatus.AUTHENTICATED);

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
            () => store.status,
            () => store.userId,
            () => store.realmManagement,
        ];

        const { isDark } = useColorMode();
        const toggleColorMode = () => {
            isDark.value = !isDark.value;
        };

        // Leaves the app: self-service lives in Authup's account console on
        // the IdP origin, so this is a plain anchor rather than a <NuxtLink>.
        //
        // The session realm rides along so that an IdP session which expired
        // under this still-authenticated UI session resumes on that realm's
        // sign-in instead of the console's realm chooser. It has to be a
        // computed: the store resolves the session AFTER setup runs, so a
        // realm read once here would be empty on exactly the page load that
        // follows the redirect back from the IdP.
        const buildAccountURL = useAccountConsoleURL();
        const accountURL = computed(() => buildAccountURL({ realmId: realmId.value }));

        return {
            accountURL,
            authenticated,
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
            <nav class="page-navbar md:flex-nowrap md:justify-start">
                <div
                    id="page-navbar"
                    class="navbar-content grow basis-full items-center md:flex!"
                    :class="{ hidden: !displayNav }"
                >
                    <VCNavItems
                        class="flex flex-col list-none md:flex-row!"
                        :data="topItems"
                        :watch="topItemsWatch"
                        registry
                        :registry-id="topRegistryId"
                    />
                    <ul class="flex flex-col list-none md:flex-row! vc-nav-items navbar-gadgets">
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
                        <template v-if="authenticated && user">
                            <li class="vc-nav-item">
                                <nuxt-link
                                    class="vc-nav-link user-link"
                                    :to="'/users/'+user.id"
                                >
                                    <!--
                                        authup >= 1.0.0-beta.63 narrows the
                                        session user to `id` / `name` /
                                        `displayName`, so no email reaches the
                                        client and a real Gravatar can no
                                        longer be resolved. The component md5s
                                        whatever it is handed, so passing the
                                        subject id keeps a stable avatar that
                                        still DIFFERS per account (an
                                        unhashable value would collapse every
                                        user onto one shared placeholder).
                                        It also stops sending a hashed email
                                        address to a third party.
                                    -->
                                    <VCGravatar :email="user.id" />
                                    <span>
                                        <FDisplayName
                                            :name="user.name"
                                            :display-name="user.displayName"
                                        />
                                    </span>
                                </nuxt-link>
                            </li>
                            <li
                                v-if="accountURL"
                                class="vc-nav-item"
                            >
                                <a
                                    :href="accountURL"
                                    class="vc-nav-link"
                                    aria-label="Account"
                                >
                                    <VCIcon name="fa6-solid:user-gear" />
                                </a>
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
