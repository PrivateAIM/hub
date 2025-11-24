<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import FProcessStatus from '../../FProcessStatus.vue';
import { FAnalysisCommand } from '../FAnalysisCommand';
import FAnalysisBuildNodesStep from './FAnalysisBuildNodesStep.vue';

export default defineComponent({
    components: {
        FAnalysisBuildNodesStep,
        FProcessStatus,
        FAnalysisCommand,
    },
    props: {
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
    <div>
        <div class="d-flex flex-row gap-1">
            <div>
                <strong>2. Build</strong>
            </div>
            <div>
                <FProcessStatus :value="entity.build_status">
                    <template #default=" { iconClass, classSuffix }">
                        <i :class="iconClass + ' text-'+ classSuffix" />
                    </template>
                </FProcessStatus>
            </div>
        </div>
        <div class="d-flex flex-column ms-3">
            <div class="d-flex flex-row gap-1">
                <div>
                    <strong>
                        2.1 Node(s) Approval
                    </strong>
                </div>
                <div>
                    <FAnalysisBuildNodesStep :entity="entity">
                        <template #valid>
                            <span class="text-success">
                                <i class="fa fa-check" />
                            </span>
                        </template>
                        <template #invalid="{ message }">
                            <span class="text-danger">
                                <i class="fa fa-times" />
                            </span>
                            <small>( {{ message }} )</small>
                        </template>
                    </FAnalysisBuildNodesStep>
                </div>
            </div>
        </div>
        <div class="d-flex flex-row gap-1">
            <div>
                <FAnalysisCommand
                    :command="'buildStart'"
                    :with-icon="true"
                    :entity="entity"
                    @executed="(command) => handleExecuted('start', command)"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
            </div>
            <div>
                <FAnalysisCommand
                    :command="'buildCheck'"
                    :with-icon="true"
                    :entity="entity"
                    @executed="(command) => handleExecuted('check', command)"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
            </div>
        </div>
    </div>
</template>
