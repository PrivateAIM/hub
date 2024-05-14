<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { useStore } from '@authup/client-web-kit';
import type { Node } from '@privateaim/core';
import { PermissionID } from '@privateaim/core';
import { storeToRefs } from 'pinia';
import { FNodeForm } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineNuxtComponent({
    components: { FNodeForm },
    emits: ['created', 'failed'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.NODE_ADD,
            ],
        });

        const store = useStore();
        const { realmManagementId, realmManagementName } = storeToRefs(store);

        const handleCreated = async (e: Node) => {
            emit('created', e);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            realmManagementName,
            realmManagementId,
            handleCreated,
            handleFailed,
        };
    },
});
</script>
<template>
    <FNodeForm
        :realm-id="realmManagementId"
        :realm-name="realmManagementName"
        @created="handleCreated"
        @failed="handleFailed"
    />
</template>
