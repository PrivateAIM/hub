<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs } from '@authup/client-web-kit';
import type { Analysis } from '@privateaim/core-kit';
import { ref } from 'vue';
import { FAnalysisBasicForm } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';
import { useRoute } from '#imports';

export default defineNuxtComponent({
    components: { FAnalysisBasicForm },
    emits: ['created'],
    setup(_props, { emit }) {
        const projectId = ref<string | null>(null);

        const store = injectStore();
        const { realmId } = storeToRefs(store);

        const route = useRoute('analyses-index-add');
        if (typeof route.query.projectId === 'string') {
            projectId.value = route.query.projectId;
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
