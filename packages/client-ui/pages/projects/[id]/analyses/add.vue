<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Analysis, Project } from '@privateaim/core-kit';
import { FAnalysisBasicForm } from '@privateaim/client-vue';
import { defineNuxtComponent, navigateTo } from '#app';

export default defineNuxtComponent({
    components: { FAnalysisBasicForm },
    props: {
        entity: {
            type: Object as PropType<Project>,
            required: true,
        },
    },
    setup() {
        const handleCreated = async (entity: Analysis) => {
            await navigateTo(`/analyses/${entity.id}/setup`);
        };

        return {
            handleCreated,
        };
    },
});
</script>
<template>
    <FAnalysisBasicForm
        :project-id="entity.id"
        @created="handleCreated"
    />
</template>
