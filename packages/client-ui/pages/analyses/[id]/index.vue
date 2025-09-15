<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import {
    FAnalysisLogs, FAnalysisNodeProgress, FAnalysisPipeline,
} from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: {
        FAnalysisLogs, FAnalysisPipeline, FAnalysisNodeProgress,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['failed', 'executed', 'updated'],
    setup(props, { emit }) {
        const handleUpdated = (entity: Analysis) => {
            emit('updated', entity);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const handleExecuted = (component: string, command: string) => {
            emit('executed', component, command);
        };

        return {
            handleUpdated,
            handleFailed,
            handleExecuted,
        };
    },
});
</script>

<template>
    <div v-if="entity">
        <div class="card-grey card mb-3">
            <div class="card-header">
                <span class="title">Nodes</span>
            </div>
            <div class="card-body text-center">
                <FAnalysisNodeProgress :entity="entity" />
            </div>
        </div>
        <div class="row">
            <div class="col-4">
                <div class="card-grey card">
                    <div class="card-header">
                        <span class="title">Pipeline</span>
                    </div>
                    <div class="card-body">
                        <FAnalysisPipeline
                            :list-direction="'column'"
                            :entity="entity"
                            @updated="handleUpdated"
                            @failed="handleFailed"
                            @executed="handleExecuted"
                        />
                    </div>
                </div>
            </div>
            <div class="col-8">
                <div class="card-grey card">
                    <div class="card-header">
                        <span class="title">Logs</span>
                    </div>
                    <div class="card-body">
                        <FAnalysisLogs :entity-id="entity.id" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.panel-box {
    background-color: #ececec;
    border: 1px solid #dedede;
    transition: all .3s ease-in-out;
    border-radius: 4px;
    padding: 0.5rem 1rem;
}
</style>
