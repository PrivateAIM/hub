<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCLink } from "@vuecs/link";
import type { Analysis } from '@privateaim/core';
import {
    AnalysisAPICommand,
    AnalysisBuildStatus, AnalysisConfigurationStatus,
    AnalysisResultStatus, AnalysisRunStatus,
    PermissionID,
} from '@privateaim/core';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { injectAuthupStore } from '../../core';
import Dropdown from '../Dropdown';
import TrainResultCommand from './command/FAnalysisResultCommand';
import TrainBuildStatusText from './FAnalysisBuildStatusText.vue';
import TrainBuildCommand from './command/FAnalysisBuildCommand';
import TrainResultStatusText from '../analysis-result/FAnalysisResultStatusText.vue';
import TrainConfigurationStatusText from './FAnalysisConfigurationStatusText.vue';

export default defineComponent({
    components: {
        VCLink,
        Dropdown,
        TrainResultCommand,
        TrainConfigurationStatusText,
        TrainResultStatusText,
        TrainBuildCommand,
        TrainBuildStatusText,
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
        const canEdit = computed(() => injectAuthupStore().has(PermissionID.ANALYSIS_EDIT));

        // ---------------------------------------------------------
        const canConfigure = computed(() => canEdit.value &&
              props.entity.configuration_status !== AnalysisConfigurationStatus.FINISHED);

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

            canConfigure,
            canEdit,
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
                <strong>1. Config</strong>
            </div>
            <div>
                Status: <train-configuration-status-text :status="entity.configuration_status" />
            </div>
            <div
                v-if="withCommand"
                class="ms-auto"
            >
                <VCLink
                    v-if="canConfigure"
                    class="btn btn-xs btn-primary"
                    type="button"
                    :to="'/analyses/'+entity.id+'/setup'"
                >
                    <i class="fas fa-wrench pe-1" /> setup
                </VCLink>
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
                Status: <train-build-status-text :status="entity.build_status" />
            </div>
            <div
                v-if="withCommand"
                class="ms-auto flex-row d-flex"
            >
                <train-build-command
                    class="me-1"
                    :command="trainCommand.BUILD_START"
                    :with-icon="true"
                    :entity="entity"
                    @executed="(command) => handleExecuted('build', command)"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
                <Dropdown
                    variant="dark"
                    :size="'xs' as 'sm'"
                    html="<i class='fa fa-bars'></i>"
                >
                    <train-build-command
                        :command="trainCommand.BUILD_STATUS"
                        :element-type="'dropDownItem'"
                        :with-icon="true"
                        :entity="entity"
                        @executed="(command) => handleExecuted('build', command)"
                        @updated="handleUpdated"
                        @failed="handleFailed"
                    />
                    <train-build-command
                        :command="trainCommand.BUILD_STOP"
                        :element-type="'dropDownItem'"
                        :with-icon="true"
                        :entity="entity"
                        @executed="(command) => handleExecuted('build', command)"
                        @updated="handleUpdated"
                        @failed="handleFailed"
                    />
                </Dropdown>
            </div>
        </div>
        <div
            class="d-flex flex-grow-1 align-items-center"
            style="flex-basis: 0"
            :class="{
                'flex-row': listDirection === 'column',
                'flex-column': listDirection === 'row'
            }"
        >
            <div class="me-1">
                <strong>4. Result</strong>
            </div>
            <div>
                Status: <train-result-status-text :status="entity.result_status" />
            </div>
            <div
                v-if="withCommand"
                class="ms-auto flex-row d-flex"
            >
                <train-result-command
                    class="me-1"
                    :command="'resultDownload'"
                    :with-icon="true"
                    :entity="entity"
                    @executed="(command) => handleExecuted('result', command)"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
                <train-result-command
                    class="me-1"
                    :command="trainCommand.RESULT_START"
                    :with-icon="true"
                    :entity="entity"
                    @executed="(command) => handleExecuted('result', command)"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
                <Dropdown
                    variant="dark"
                    :size="'xs' as 'sm'"
                >
                    <train-result-command
                        :command="trainCommand.RESULT_STATUS"
                        :with-icon="true"
                        :element-type="'dropDownItem'"
                        :entity="entity"
                        @executed="(command) => handleExecuted('result', command)"
                        @updated="handleUpdated"
                        @failed="handleFailed"
                    />
                </Dropdown>
            </div>
        </div>
    </div>
</template>
