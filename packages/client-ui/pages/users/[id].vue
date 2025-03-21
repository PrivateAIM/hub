<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectHTTPClient } from '@authup/client-web-kit';
import type { User } from '@authup/core-kit';
import { isClientErrorWithStatusCode } from 'hapic';
import type { Ref } from 'vue';
import { ref } from 'vue';
import { definePageMeta } from '#imports';
import {
    createError, defineNuxtComponent, navigateTo, useRoute,
} from '#app';
import DomainEntityNav from '../../components/DomainEntityNav';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';

export default defineNuxtComponent({
    components: { DomainEntityNav },
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
                navigateTo({
                    path: '/',
                });
            }

            throw createError({});
        }

        const tabs = [
            {
                name: 'General', routeName: 'users-id', icon: 'fas fa-bars', path: '',
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
                {{ user.name }}
                <span class="sub-title">Profil</span>
            </h4>
        </div>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <DomainEntityNav
                        :items="tabs"
                        :path="'/users/' + user.id"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
