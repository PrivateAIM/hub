<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import FAnalysisConfigurationStep from './FAnalysisConfigurationStep.vue';

export default defineComponent({
    components: {
        FAnalysisConfigurationStep,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'executed', 'failed'],
    setup() {

    },
});
</script>
<template>
    <div>
        <FAnalysisConfigurationStep
            :entity="entity"
            :entity-id="entity.id"
        />

        <hr>
    </div>
</template>
