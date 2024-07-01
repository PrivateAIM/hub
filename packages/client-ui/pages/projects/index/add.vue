<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Project } from '@privateaim/core-kit';
import { FProjectForm } from '@privateaim/client-vue';
import { PermissionName } from '@privateaim/kit';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    components: {
        FProjectForm,
    },
    emits: ['created'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.PROJECT_CREATE,
            ],
        });
        const handleCreated = (entity: Project) => {
            emit('created', entity);
        };

        return {
            handleCreated,
        };
    },
});
</script>
<template>
    <FProjectForm @created="handleCreated" />
</template>
