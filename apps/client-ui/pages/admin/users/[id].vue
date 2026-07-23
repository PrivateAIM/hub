<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { injectHTTPClient } from '@authup/client-web-kit';
import type { User } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { FDisplayName } from '@privateaim/client-vue';
import { VCIcon } from '@vuecs/icon';
import type { NavigationItem } from '@vuecs/navigation';
import { computed, defineComponent, ref } from 'vue';
import type { Ref } from 'vue';
import {
    definePageMeta,
    updateObjectProperties,
    useToast,
} from '#imports';
import {
    createError,
    navigateTo,
    useRoute,
} from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineComponent({
    components: { FDisplayName, VCIcon },
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.USER_UPDATE,
                PermissionName.USER_ROLE_CREATE,
                PermissionName.USER_ROLE_UPDATE,
                PermissionName.USER_ROLE_DELETE,
            ],
        });

        const toast = useToast();
        const route = useRoute();

        const entity : Ref<User> = ref(null) as any;

        try {
            entity.value = await injectHTTPClient()
                .user
                .getOne(route.params.id as string, { fields: ['+email'] });
        } catch {
            await navigateTo({ path: '/admin/users' });
            throw createError({});
        }

        const items = computed<NavigationItem[]>(() => {
            const base = `/admin/users/${entity.value?.id}`;

            return [
                {
                    name: '',
                    icon: 'fa6-solid:arrow-left',
                    url: '/admin/users',
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
                    name: 'Roles',
                    icon: 'fa6-solid:user-group',
                    url: `${base}/roles`,
                },
            ];
        });

        const handleUpdated = (e: User) => {
            toast.show({ variant: 'success', body: 'The user was successfully updated.' });

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
