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
import { FAnalysisCommand } from '../FAnalysisCommand';
import FAnalysisBuildStatus from '../status/FAnalysisBuildStatus.vue';

export default defineComponent({
    components: {
        FAnalysisBuildStatus,
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
                <FAnalysisBuildStatus :status="entity.build_status">
                    <template #default=" { iconClass, classSuffix }">
                        <i :class="iconClass + ' text-'+ classSuffix" />
                    </template>
                </FAnalysisBuildStatus>
            </div>
        </div>
        <div class="mt-1">
            <div>
                <FAnalysisCommand
                    :command="'buildStart'"
                    :with-icon="true"
                    :entity="entity"
                    @executed="(command) => handleExecuted('build', command)"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
            </div>
            <div>
                <FAnalysisCommand
                    :command="'buildStatus'"
                    :with-icon="true"
                    :entity="entity"
                    @executed="(command) => handleExecuted('build', command)"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
            </div>
            <div>
                <FAnalysisCommand
                    :command="'buildStop'"
                    :with-icon="true"
                    :entity="entity"
                    @executed="(command) => handleExecuted('build', command)"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
            </div>
        </div>
    </div>
</template>
