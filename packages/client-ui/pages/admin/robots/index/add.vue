<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { ARobotForm } from '@authup/client-web-kit';
import type { Robot } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { defineNuxtComponent, navigateTo } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineNuxtComponent({
    components: {
        ARobotForm,
    },
    emits: ['failed', 'created'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.ROBOT_ADD,
            ],
        });

        const handleCreated = (e: Robot) => {
            navigateTo({ path: `/admin/robots/${e.id}` });
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            handleCreated,
            handleFailed,
        };
    },
});
</script>
<template>
    <ARobotForm
        @created="handleCreated"
        @failed="handleFailed"
    />
</template>
