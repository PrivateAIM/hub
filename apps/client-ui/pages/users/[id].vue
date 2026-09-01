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
import { definePageMeta } from '#imports';
import {
    defineNuxtComponent,
    useRoute,
} from '#app';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';
import { useEntityRecord } from '../../composables/entity-record';

export default defineNuxtComponent({
    components: { FDisplayName },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const route = useRoute('users-id');

        // Resolved up front: the handler can run after setup's first await,
        // where `inject()` no longer resolves.
        const httpClient = injectHTTPClient();

        // Behaviour change: EVERY failure now redirects to `/`. The 404-only
        // check this replaces could not survive `useAsyncData`, which re-wraps
        // a rejection as a `NuxtError` — so hapic's `instanceof`-based
        // `isClientErrorWithStatusCode` would never match again. It was the
        // worse behaviour regardless: a 403 rendered a blank error page, and a
        // 404 raced an unawaited navigation against the thrown error.
        //
        // `.data` unwraps the `{ data, meta }` envelope authup has wrapped
        // every single-record endpoint in since beta.57.
        const user = await useEntityRecord<User>(
            `user:${route.params.id}`,
            () => httpClient.user
                .getOne(route.params.id as string)
                .then((response) => response.data),
            '/',
        );

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
                    :display-name="user.displayName"
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
