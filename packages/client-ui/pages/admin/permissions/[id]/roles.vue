<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { APagination, APermissionRoleAssignments } from '@authup/client-web-kit';
import type { Permission } from '@authup/core-kit';
import type { PropType } from 'vue';
import { defineNuxtComponent } from '#imports';

export default defineNuxtComponent({
    components: {
        APagination,
        APermissionRoleAssignments,
    },
    props: {
        entity: {
            type: Object as PropType<Permission>,
            required: true,
        },
    },
});
</script>
<template>
    <APermissionRoleAssignments :entity-id="entity.id">
        <template #footer="props">
            <APagination
                :busy="props.busy"
                :meta="props.meta"
                :load="props.load"
            />
        </template>
    </APermissionRoleAssignments>
</template>
