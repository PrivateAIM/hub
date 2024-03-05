<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Project } from '@privateaim/core';
import { FAnalysisBasicForm } from '@privateaim/client-vue';
import { defineNuxtComponent, navigateTo } from '#app';

export default defineNuxtComponent({
    components: { TrainBasicForm: FAnalysisBasicForm },
    props: {
        proposal: {
            type: Object as PropType<Project>,
            required: true,
        },
    },
    setup(props) {
        const handleCreated = async () => {
            await navigateTo(`/proposals/${props.proposal.id}/trains`);
        };

        return {
            handleCreated,
        };
    },
});
</script>
<template>
    <TrainBasicForm
        :project-id="proposal.id"
        @created="handleCreated"
    />
</template>
