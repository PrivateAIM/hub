<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { useStore } from '@authup/client-web-kit';
import type { Analysis } from '@privateaim/core';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { FAnalysisBasicForm } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';
import { useRoute } from '#imports';

export default defineNuxtComponent({
    components: { FAnalysisBasicForm },
    emits: ['created'],
    setup(_props, { emit }) {
        const projectId = ref<string | null>(null);

        const store = useStore();
        const { realmId } = storeToRefs(store);

        const route = useRoute();
        if (typeof route.query.project_id === 'string') {
            projectId.value = route.query.project_id;
        }

        const handleCreated = async (entity: Analysis) => {
            emit('created', entity);
        };

        return {
            projectId,
            realmId,
            handleCreated,
        };
    },
});
</script>
<template>
    <FAnalysisBasicForm
        :project-id="projectId"
        :realm-id="realmId"
        @created="handleCreated"
    />
</template>
