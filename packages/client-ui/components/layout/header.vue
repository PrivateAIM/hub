<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs } from '@authup/client-web-kit';
import { VCGravatar } from '@vuecs/gravatar';
import { VCNavItems } from '@vuecs/navigation';
import { BCollapse } from 'bootstrap-vue-next';
import { computed } from 'vue';
import { ref } from '#imports';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: {
        BCollapse,
        VCGravatar,
        VCNavItems,
    },
    setup() {
        const store = injectStore();
        const { loggedIn, user, realmManagementName } = storeToRefs(store);

        const displayNav = ref(false);

        const toggleNav = () => {
            displayNav.value = !displayNav.value;
        };

        const infoText = computed(() => realmManagementName.value || 'PrivateAim');

        return {
            infoText,
            loggedIn,
            user,
            toggleNav,
            displayNav,
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
                    <span>H</span>U<span>B</span>
                    <span class="info-text">{{ infoText }}</span>
                </div>
            </div>
            <nav class="page-navbar navbar-expand-md">
                <b-collapse
                    id="page-navbar"
                    class="navbar-content navbar-collapse collapse"
                    :class="{'show': displayNav}"
                >
                    <VCNavItems
                        class="navbar-nav"
                        :level="0"
                    />
                    <ul
                        v-if="loggedIn && user"
                        class="navbar-nav vc-nav-items navbar-gadgets"
                    >
                        <li class="vc-nav-item">
                            <nuxt-link
                                class="vc-nav-link user-link"
                                :to="'/users/'+user.id"
                            >
                                <VCGravatar :email="user.email ? user.email : ''" />
                                <span>{{ user.display_name ? user.display_name : user.name }}</span>
                            </nuxt-link>
                        </li>
                        <li class="vc-nav-item">
                            <nuxt-link
                                :to="'/settings'"
                                class="vc-nav-link"
                            >
                                <i class="fa fa-cog" />
                            </nuxt-link>
                        </li>
                        <li class="vc-nav-item">
                            <nuxt-link
                                :to="'/logout'"
                                class="vc-nav-link"
                            >
                                <i class="fa fa-power-off" />
                            </nuxt-link>
                        </li>
                    </ul>
                </b-collapse>
            </nav>
        </header>
    </div>
</template>
