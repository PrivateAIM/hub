<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { injectHTTPClient, useStore } from '@authup/client-web-kit';
import type { User } from '@authup/core-kit';
import { PermissionName, isRealmResourceWritable } from '@authup/core-kit';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';
import {
    definePageMeta, updateObjectProperties, useToast,
} from '#imports';
import {
    createError, defineNuxtComponent, navigateTo, useRoute,
} from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';
import DomainEntityNav from '../../../components/DomainEntityNav';

export default defineNuxtComponent({
    components: { DomainEntityNav },
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.USER_EDIT,
                PermissionName.USER_ROLE_ADD,
                PermissionName.USER_ROLE_EDIT,
                PermissionName.USER_ROLE_DROP,
            ],
        });

        const items = [
            {
                name: 'General', icon: 'fas fa-bars', urlSuffix: '',
            },
            {
                name: 'Permissions', icon: 'fas fa-user-secret', urlSuffix: 'permissions',
            },
            {
                name: 'Roles', icon: 'fa-solid fa-user-group', urlSuffix: 'roles',
            },
        ];

        const toast = useToast();
        const route = useRoute();
        const store = useStore();

        const entity : Ref<User> = ref(null) as any;

        try {
            entity.value = await injectHTTPClient()
                .user
                .getOne(route.params.id as string, { fields: ['+email'] });
        } catch (e) {
            await navigateTo({ path: '/admin/users' });
            throw createError({});
        }

        const { realmManagement } = storeToRefs(store);

        if (!isRealmResourceWritable(realmManagement.value, entity.value.realm_id)) {
            await navigateTo({ path: '/admin/users' });
            throw createError({});
        }

        const handleUpdated = (e: User) => {
            toast.show({ variant: 'success', body: 'The user was successfully updated.' });

            updateObjectProperties(entity, e);
        };

        const handleFailed = (e: Error) => {
            toast.show({ variant: 'success', body: e.message });
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
            <i class="fa fa-user me-1" />
            {{ entity.name }}
            <span class="sub-title ms-1">
                Details
            </span>
        </h1>
        <div class="mb-2">
            <DomainEntityNav
                :items="items"
                :path="`/admin/users/${entity.id}`"
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
