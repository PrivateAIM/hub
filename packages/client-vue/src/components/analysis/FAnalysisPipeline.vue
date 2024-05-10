<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis } from '@privateaim/core';
import {
    AnalysisAPICommand,
    AnalysisBuildStatus,
    AnalysisConfigurationStatus,
    AnalysisResultStatus,
    AnalysisRunStatus,
} from '@privateaim/core';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FAnalysisCommand } from './FAnalysisCommand';
import FAnalysisBuildStatusText from './FAnalysisBuildStatusText.vue';
import FAnalysisConfigurationStatusText from './FAnalysisConfigurationStatusText.vue';

export default defineComponent({
    components: {
        FAnalysisBuildStatusText,
        FAnalysisConfigurationStatusText,
        FAnalysisCommand,
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
            trainBuildStatus: AnalysisBuildStatus,
            trainConfigurationStatus: AnalysisConfigurationStatus,
            trainRunStatus: AnalysisRunStatus,
            trainResultStatus: AnalysisResultStatus,
            trainCommand: AnalysisAPICommand,

            busy: false,

            handleUpdated,
            handleFailed,
            handleExecuted,
        };
    },
});
</script>
<template>
    <div
        class="d-flex justify-content-between mb-2 mt-2"
        :class="{
            'flex-column': listDirection === 'column',
            'flex-row': listDirection === 'row'
        }"
    >
        <div
            class="d-flex flex-grow-1 align-items-center"
            style="flex-basis: 0"
            :class="{
                'mb-2 flex-row': listDirection === 'column',
                'flex-column': listDirection === 'row'
            }"
        >
            <div class="me-1">
                <strong>1. Configuration</strong>
            </div>
            <div>
                Status: <FAnalysisConfigurationStatusText :locked="entity.configuration_locked" />
            </div>
            <div
                v-if="withCommand"
                class="ms-auto"
            >
                <FAnalysisCommand
                    :command="trainCommand.CONFIGURATION_LOCK"
                    :with-icon="true"
                    :entity="entity"
                    @executed="(command: string) => handleExecuted('configuration', command)"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
                <FAnalysisCommand
                    :command="trainCommand.CONFIGURATION_UNLOCK"
                    :with-icon="true"
                    :entity="entity"
                    @executed="(command: string) => handleExecuted('configuration', command)"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
            </div>
        </div>

        <div
            class="d-flex flex-grow-1 align-items-center"
            style="flex-basis: 0"
            :class="{
                'mb-2 flex-row': listDirection === 'column',
                'flex-column': listDirection === 'row'
            }"
        >
            <div class="me-1">
                <strong>2. Build</strong>
            </div>
            <div>
                Status: <FAnalysisBuildStatusText :status="entity.build_status" />
            </div>
            <div
                v-if="withCommand"
                class="ms-auto flex-row d-flex justify-between gap-1"
            >
                <div>
                    <FAnalysisCommand
                        :command="trainCommand.BUILD_START"
                        :with-icon="true"
                        :entity="entity"
                        @executed="(command) => handleExecuted('build', command)"
                        @updated="handleUpdated"
                        @failed="handleFailed"
                    />
                </div>
                <div>
                    <FAnalysisCommand
                        :command="trainCommand.BUILD_STATUS"
                        :with-icon="true"
                        :entity="entity"
                        @executed="(command) => handleExecuted('build', command)"
                        @updated="handleUpdated"
                        @failed="handleFailed"
                    />
                </div>
                <div>
                    <FAnalysisCommand
                        :command="trainCommand.BUILD_STOP"
                        :with-icon="true"
                        :entity="entity"
                        @executed="(command) => handleExecuted('build', command)"
                        @updated="handleUpdated"
                        @failed="handleFailed"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
