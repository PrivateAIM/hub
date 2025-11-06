<!--
  - Copyright (c) 2021-2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import FAnalysisBuildStatus from './FAnalysisBuildStatus.vue';
import FAnalysisConfigurationStatus from './FAnalysisConfigurationStatus.vue';
import FAnalysisExecutionStatus from './FAnalysisExecutionStatus.vue';

export default defineComponent({
    components: {
        FAnalysisExecutionStatus,
        FAnalysisBuildStatus,
        FAnalysisConfigurationStatus,
    },
    props: {
        listDirection: {
            type: String,
            default: 'row',
        },
        withCommand: {
            type: Boolean,
            default: true,
        },
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'executed', 'failed'],
    setup(props, { emit }) {
        const handleExecuted = (type: string, command: string) => {
            emit('executed', type, command);
        };
        const handleUpdated = (item: Analysis) => {
            emit('updated', item);
        };
        const handleFailed = (e: Error) => {
            emit('failed', e);
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
    <div
        class="d-flex justify-content-around"
        :class="{
            'flex-column': listDirection === 'column',
            'flex-row': listDirection === 'row'
        }"
    >
        <div>
            <slot
                name="beforeConfiguration"
                v-bind="entity"
            />
            <div
                class="d-flex flex-grow-1 align-items-center"
                style="flex-basis: 0"
                :class="{
                    'flex-row': listDirection === 'column',
                    'flex-column': listDirection === 'row'
                }"
            >
                <div class="me-1">
                    <strong>Configuration</strong>
                </div>
                <div>
                    <FAnalysisConfigurationStatus :locked="entity.configuration_locked" />
                </div>
            </div>

            <slot
                name="afterConfiguration"
                v-bind="entity"
            />
        </div>

        <div>
            <slot
                name="beforeBuild"
                v-bind="entity"
            />

            <div
                class="d-flex flex-grow-1 align-items-center"
                style="flex-basis: 0"
                :class="{
                    'flex-row': listDirection === 'column',
                    'flex-column': listDirection === 'row'
                }"
            >
                <div class="me-1">
                    <strong>Build</strong>
                </div>
                <div>
                    <FAnalysisBuildStatus :status="entity.build_status" />
                </div>
            </div>

            <slot
                name="afterBuild"
                v-bind="entity"
            />
        </div>

        <div>
            <slot
                name="beforeRun"
                v-bind="entity"
            />

            <div
                class="d-flex flex-grow-1 align-items-center"
                style="flex-basis: 0"
                :class="{
                    'flex-row': listDirection === 'column',
                    'flex-column': listDirection === 'row'
                }"
            >
                <div class="me-1">
                    <strong>Run</strong>
                </div>
                <div>
                    <FAnalysisExecutionStatus :status="entity.execution_status" />
                </div>
            </div>

            <slot
                name="afterRun"
                v-bind="entity"
            />
        </div>
    </div>
</template>
