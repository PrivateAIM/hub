<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Registry } from '@privateaim/core';
import { PermissionID } from '@privateaim/core';
import { RegistryForm } from '@privateaim/client-vue';
import { definePageMeta, navigateTo } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    components: { RegistryForm },
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.ROBOT_ADD,
            ],
        });

        const handleCreated = async (e: Registry) => {
            await navigateTo(`/admin/services/registry/${e.id}`);
        };

        return {
            handleCreated,
        };
    },
});
</script>
<template>
    <RegistryForm @created="handleCreated" />
</template>
