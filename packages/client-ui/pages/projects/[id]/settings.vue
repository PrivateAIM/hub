<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Project } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { PropType } from 'vue';
import { FProjectForm } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionName.PROJECT_UPDATE,
            PermissionName.PROJECT_DELETE,
        ],
    },
    components: { FProjectForm },
    props: {
        entity: {
            type: Object as PropType<Project>,
            required: true,
        },
    },
    emits: ['updated'],
    setup(props, { emit }) {
        const handleUpdated = (entity: Project) => {
            emit('updated', entity);
        };

        return {
            handleUpdated,
        };
    },
});
</script>
<template>
    <FProjectForm
        :entity="entity"
        @updated="handleUpdated"
    />
</template>
