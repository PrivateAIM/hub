<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectHTTPClient } from '@authup/client-web-kit';
import type { User } from '@authup/core-kit';
import { FDisplayName } from '@privateaim/client-vue';
import type { NavigationItem } from '@vuecs/navigation';
import { isClientErrorWithStatusCode } from 'hapic';
import type { Ref } from 'vue';
import { ref } from 'vue';
import { definePageMeta } from '#imports';
import {
    createError,
    defineNuxtComponent,
    navigateTo,
    useRoute,
} from '#app';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';

export default defineNuxtComponent({
    components: { FDisplayName },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const user = ref<null | User>(null) as Ref<User>;

        try {
            user.value = await injectHTTPClient().user.getOne(useRoute().params.id as string);
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 404)) {
                navigateTo({ path: '/' });
            }

            throw createError({});
        }

        const base = `/users/${user.value.id}`;
        const tabs: NavigationItem[] = [
            {
                name: 'General',
                icon: 'fa6-solid:bars',
                url: base,
            },
        ];

        return {
            tabs,
            user,
        };
    },
});
</script>
<template>
    <div class="">
        <div class="m-b-10">
            <h4 class="title">
                <FDisplayName
                    :name="user.name"
                    :display-name="user.display_name"
                />
                <span class="sub-title">Profil</span>
            </h4>
        </div>

        <div class="m-b-20 m-t-10">
            <div class="card card-panel">
                <div class="card-body">
                    <VCNavItems
                        :data="tabs"
                        variant="pills"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
