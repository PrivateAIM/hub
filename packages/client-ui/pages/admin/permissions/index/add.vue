<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { APermissionForm } from '@authup/client-vue';
import type { Permission } from '@authup/core';
import { PermissionName } from '@authup/core';
import { storeToRefs } from 'pinia';
import { defineNuxtComponent, navigateTo } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';
import { useAuthStore } from '../../../../store/auth';

export default defineNuxtComponent({
    components: {
        APermissionForm,
    },
    emits: ['failed', 'created'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.PERMISSION_ADD,
            ],
        });

        const handleCreated = (e: Permission) => {
            navigateTo({ path: `/admin/permissions/${e.id}` });
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const store = useAuthStore();
        const { realmManagementId } = storeToRefs(store);

        return {
            realmManagementId,
            handleCreated,
            handleFailed,
        };
    },
});
</script>
<template>
    <APermissionForm
        :realm-id="realmManagementId"
        @failed="handleFailed"
        @created="handleCreated"
    />
</template>
