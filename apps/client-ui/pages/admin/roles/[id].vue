<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { injectHTTPClient } from '@authup/client-web-kit';
import type { Role } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { FDisplayName } from '@privateaim/client-vue';
import type { NavigationItem } from '@vuecs/navigation';
import { computed, defineComponent, ref } from 'vue';
import type { Ref } from 'vue';
import {
    definePageMeta,
    useToast,
} from '#imports';
import {
    createError, 
    navigateTo, 
    useRoute,
} from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';
import { updateObjectProperties } from '../../../utils';

export default defineComponent({
    components: { FDisplayName },
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.ROLE_UPDATE,
                PermissionName.USER_ROLE_CREATE,
                PermissionName.USER_ROLE_UPDATE,
                PermissionName.USER_ROLE_DELETE,
            ],
        });

        const toast = useToast();
        const route = useRoute();

        const entity : Ref<Role> = ref(null) as any;

        try {
            entity.value = await injectHTTPClient()
                .role
                .getOne(route.params.id as string);
        } catch {
            await navigateTo({ path: '/admin/roles' });
            throw createError({});
        }

        const items = computed<NavigationItem[]>(() => {
            const base = `/admin/roles/${entity.value?.id}`;
            return [
                {
                    name: '', 
                    icon: 'fa6-solid:arrow-left', 
                    url: '/admin/roles', 
                },
                {
                    name: 'General', 
                    icon: 'fa6-solid:bars', 
                    url: base, 
                },
                {
                    name: 'Permissions', 
                    icon: 'fa6-solid:user-secret', 
                    url: `${base}/permissions`, 
                },
                {
                    name: 'Users', 
                    icon: 'fa6-solid:users', 
                    url: `${base}/users`, 
                },
            ];
        });

        const handleUpdated = (e: Role) => {
            toast.show({ variant: 'success', body: 'The role was successfully updated.' });

            updateObjectProperties(entity, e);
        };

        const handleFailed = (e: Error) => {
            toast.show({ variant: 'success', body: e.message });
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
            <VCIcon
                name="fa6-solid:masks-theater"
                class="me-1"
            /> <FDisplayName
                :name="entity.name"
                :display-name="entity.display_name"
            />
            <span class="sub-title ms-1">Details</span>
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
