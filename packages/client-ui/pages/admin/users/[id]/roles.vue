<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">

import { APagination, AUserRoleAssignments } from '@authup/client-vue';
import type { User } from '@authup/core';
import type { PropType } from 'vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: {
        APagination,
        AUserRoleAssignments,
    },
    props: {
        entity: {
            type: Object as PropType<User>,
            required: true,
        },
    },
    setup(props) {
        return {
            entity: props.entity,
        };
    },
});
</script>
<template>
    <AUserRoleAssignments :entity-id="entity.id">
        <template #footer="props">
            <APagination
                :busy="props.busy"
                :meta="props.meta"
                :load="props.load"
            />
        </template>
    </AUserRoleAssignments>
</template>
