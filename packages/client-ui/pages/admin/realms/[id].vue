<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { injectHTTPClient, useStore } from '@authup/client-web-kit';
import type { Realm } from '@authup/core-kit';
import { PermissionName, isRealmResourceWritable } from '@authup/core-kit';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';
import {
    definePageMeta,
    useToast,
} from '#imports';
import {
    createError, defineNuxtComponent, navigateTo, useRoute,
} from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';
import { updateObjectProperties } from '../../../utils';

export default defineNuxtComponent({
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.REALM_EDIT,
            ],
        });

        const items = [
            {
                name: 'General', icon: 'fas fa-bars', urlSuffix: '',
            },
        ];

        const toast = useToast();
        const route = useRoute();
        const store = useStore();

        const entity: Ref<Realm> = ref(null) as any;

        try {
            entity.value = await injectHTTPClient()
                .realm
                .getOne(route.params.id as string);
        } catch (e) {
            await navigateTo({ path: '/admin/realms' });
            throw createError({});
        }

        const { realmManagement } = storeToRefs(store);

        if (!isRealmResourceWritable(realmManagement.value, entity.value.id)) {
            await navigateTo({ path: '/admin/realms' });
            throw createError({});
        }

        const handleUpdated = (e: Realm) => {
            toast.show({ variant: 'success', body: 'The realm was successfully updated.' });

            updateObjectProperties(entity, e);
        };

        const handleFailed = (e: Error) => {
            toast.show({ variant: 'warning', body: e.message });
        };

        return {
            entity,
            items,
            handleUpdated,
            handleFailed,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <i class="fa-solid fa-building me-1" /> {{ entity.name }}
            <span class="sub-title ms-1">Details</span>
        </h1>
        <div class="mb-2">
            <DomainEntityNav
                :path="'/admin/realms/'+entity.id"
                :items="items"
                :prev-link="true"
            />
        </div>
        <div>
            <NuxtPage
                :entity="entity"
                @updated="handleUpdated"
                @failed="handleFailed"
            />
        </div>
    </div>
</template>
