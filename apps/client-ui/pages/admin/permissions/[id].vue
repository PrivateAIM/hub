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
import { FDisplayName } from '@privateaim/client-vue';
import { VCIcon } from '@vuecs/icon';

import type { NavigationItem } from '@vuecs/navigation';
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { useEntityRecord } from '../../../composables/entity-record';
import { useToast } from '../../../composables/toast';
import { updateObjectProperties } from '../../../utils';

export default defineComponent({
    components: { FDisplayName, VCIcon },
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.PERMISSION_UPDATE,
            ],
        });

        const toast = useToast();
        const route = useRoute('admin-permissions-id');

        // Resolved up front: the handler can run after setup's first await,
        // where `inject()` no longer resolves.
        const httpClient = injectHTTPClient();

        const entity = await useEntityRecord<Permission>(
            `permission:${route.params.id}`,
            () => httpClient
                .permission
                .getOne(route.params.id as string)
                .then((response) => response.data),
            '/admin/permissions',
        );

        const items = computed<NavigationItem[]>(() => {
            const base = `/admin/permissions/${entity.value?.id}`;
            return [
                {
                    name: '', 
                    icon: 'fa6-solid:arrow-left', 
                    url: '/admin/permissions', 
                },
                {
                    name: 'General', 
                    icon: 'fa6-solid:bars', 
                    url: base, 
                },
                {
                    name: 'Policies', 
                    icon: 'fa6-solid:shield-halved', 
                    url: `${base}/policies`, 
                },
                {
                    name: 'Users', 
                    icon: 'fa6-solid:user', 
                    url: `${base}/users`, 
                },
                {
                    name: 'Clients',
                    icon: 'fa6-solid:robot',
                    url: `${base}/clients`,
                },
                {
                    name: 'Roles', 
                    icon: 'fa6-solid:user-group', 
                    url: `${base}/roles`, 
                },
            ];
        });

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
            <FDisplayName
                :name="entity.name"
                :display-name="entity.displayName"
            />
            <span class="sub-title ms-1">
                Details
            </span>
        </h1>
        <div class="mb-2">
            <VCNavItems
                :data="items"
                variant="pills"
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
