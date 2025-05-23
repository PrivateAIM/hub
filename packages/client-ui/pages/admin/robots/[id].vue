<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { injectHTTPClient } from '@authup/client-web-kit';
import type { Robot } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { defineComponent, ref } from 'vue';
import type { Ref } from 'vue';
import {
    definePageMeta,
    useToast,
} from '#imports';
import {
    createError, navigateTo, useRoute,
} from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';
import { updateObjectProperties } from '../../../utils';

export default defineComponent({
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.ROBOT_UPDATE,
                PermissionName.ROBOT_ROLE_CREATE,
                PermissionName.ROBOT_ROLE_UPDATE,
                PermissionName.ROBOT_ROLE_DELETE,
            ],
        });

        const items = [
            {
                name: 'General', icon: 'fas fa-bars', path: '',
            },
            {
                name: 'Permissions', icon: 'fas fa-user-secret', path: 'permissions',
            },
            {
                name: 'Roles', icon: 'fa-solid fa-user-group', path: 'roles',
            },
        ];

        const toast = useToast();
        const route = useRoute();

        const entity: Ref<Robot> = ref(null) as any;

        try {
            entity.value = await injectHTTPClient()
                .robot
                .getOne(route.params.id as string, { fields: ['+secret'] });
        } catch (e) {
            await navigateTo({ path: '/admin/robots' });
            createError({});
        }

        const handleUpdated = (e: Robot) => {
            toast.show({ variant: 'success', body: 'The robot was successfully updated.' });

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
            <i class="fa-solid fa-robot me-1" /> {{ entity.name }}
            <span class="sub-title ms-1">Details</span>
        </h1>
        <div class="mb-2">
            <DomainEntityNav
                :path="'/admin/robots/'+entity.id"
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
