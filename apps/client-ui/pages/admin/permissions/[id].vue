<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { injectHTTPClient } from '@authup/client-web-kit';
import type { Permission } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';

import { defineComponent, ref } from 'vue';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { createError, definePageMeta, navigateTo } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { useToast } from '../../../composables/toast';
import { updateObjectProperties } from '../../../utils';

export default defineComponent({
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.PERMISSION_UPDATE,
            ],
        });

        const items = [
            {
                name: 'General',
                icon: 'fa6-solid:bars',
                path: '',
            },
            {
                name: 'Policies',
                icon: 'fa6-solid:shield-halved',
                path: 'policies',
            },
            {
                name: 'Users',
                icon: 'fa6-solid:user',
                path: 'users',
            },
            {
                name: 'Robots',
                icon: 'fa6-solid:robot',
                path: 'robots',
            },
            {
                name: 'Roles',
                icon: 'fa6-solid:user-group',
                path: 'roles',
            },
        ];

        const toast = useToast();
        const route = useRoute();

        const entity : Ref<Permission> = ref(null) as any;

        try {
            entity.value = await injectHTTPClient()
                .permission
                .getOne(route.params.id as string);
        } catch {
            await navigateTo({ path: '/admin/permissions' });
            throw createError({});
        }

        const handleUpdated = (e: Permission) => {
            toast.show({ variant: 'success', body: 'The permission was successfully updated.' });

            updateObjectProperties(entity, e);
        };

        const handleFailed = (e: Error) => {
            toast.show({ variant: 'warning', body: e.message });
        };

        return {
            items,
            entity,
            handleUpdated,
            handleFailed,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <VCIcon
                name="fa6-solid:user"
                class="me-1"
            />
            {{ entity.name }}
            <span class="sub-title ms-1">
                Details
            </span>
        </h1>
        <div class="mb-2">
            <DomainEntityNav
                :items="items"
                :path="`/admin/permissions/${entity.id}`"
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
