<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { APagination, APermissionUserAssignments } from '@authup/client-web-kit';
import type { Permission } from '@authup/core-kit';
import type { PropType } from 'vue';
import { defineNuxtComponent } from '#imports';

export default defineNuxtComponent({
    components: {
        APagination,
        APermissionUserAssignments,
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
    <APermissionUserAssignments :entity-id="entity.id">
        <template #footer="props">
            <APagination
                :busy="props.busy"
                :meta="props.meta"
                :load="props.load"
            />
        </template>
    </APermissionUserAssignments>
</template>
