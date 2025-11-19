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
import FAnalysisBuildStep from './FAnalysisBuildStep.vue';
import FAnalysisDistributionStep from './FAnalysisDistributionStep.vue';
import FAnalysisExecutionStep from './FAnalysisExecutionStep.vue';

export default defineComponent({
    components: {
        FAnalysisDistributionStep,
        FAnalysisRunStep: FAnalysisExecutionStep,
        FAnalysisBuildStep,
        FAnalysisConfigurationStep,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        configurationNodesLink: {
            type: String,
        },
        configurationCodeLink: {
            type: String,
        },
        configurationImageLink: {
            type: String,
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
            :image-link="configurationImageLink"
            :nodes-link="configurationNodesLink"
            :code-link="configurationCodeLink"
            @failed="(e) => $emit('failed', e)"
            @updated="(e) => $emit('updated', e)"
        />

        <hr>

        <FAnalysisBuildStep
            :entity="entity"
            @failed="(e) => $emit('failed', e)"
            @updated="(e) => $emit('updated', e)"
        />

        <hr>

        <FAnalysisDistributionStep
            :entity="entity"
            @failed="(e) => $emit('failed', e)"
            @updated="(e) => $emit('updated', e)"
        />

        <hr>

        <FAnalysisRunStep
            :entity="entity"
            @failed="(e) => $emit('failed', e)"
            @updated="(e) => $emit('updated', e)"
        />
    </div>
</template>
