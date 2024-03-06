<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Analysis } from '@privateaim/core';
import { FAnalysisWizard } from '@privateaim/client-vue';
import { navigateTo } from '#imports';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { FAnalysisWizard },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'failed'],
    setup(props, { emit }) {
        const handleFinished = async () => {
            await navigateTo(`/analyses/${props.entity.id}`);
        };

        const handleUpdated = (entity: Analysis) => {
            emit('updated', entity);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            handleFinished,
            handleUpdated,
            handleFailed,
        };
    },
});
</script>
<template>
    <FAnalysisWizard
        v-if="entity"
        :entity="entity"
        @updated="handleUpdated"
        @finished="handleFinished"
        @failed="handleFailed"
    />
</template>
