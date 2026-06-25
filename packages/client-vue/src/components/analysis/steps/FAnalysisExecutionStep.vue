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
import { computed, defineComponent } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import FProcessStatus from '../../FProcessStatus.vue';
import FAnalysisNodeExecutionList from '../../analysis-node/FAnalysisNodeExecutionList.vue';
import { FProgressBar } from '../../utility';
import { resolveTextColorClass } from '../../../core';

export default defineComponent({
    components: {
        FProcessStatus, 
        FProgressBar, 
        FAnalysisNodeExecutionList, 
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'executed', 'failed'],
    setup(props, { emit }) {
        const progress = computed(() => {
            if (props.entity.execution_status === ProcessStatus.EXECUTED) {
                return 100;
            }

            return props.entity.execution_progress || 0;
        });

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
            progress,
            handleUpdated,
            handleFailed,
            handleExecuted,
            resolveTextColorClass,
        };
    },
});
</script>
<template>
    <div class="card-grey card grow">
        <div class="card-header">
            <div class="title flex flex-row">
                <div>
                    4. Execution
                </div>
                <div class="ms-auto">
                    <FProcessStatus :value="entity.execution_status">
                        <template #default=" { iconName, iconClass, classSuffix }">
                            <VCIcon
                                :name="iconName"
                                :class="[iconClass, resolveTextColorClass(classSuffix)]"
                            />
                        </template>
                    </FProcessStatus>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="text-center mb-3">
                <VCIcon
                    name="fa6-solid:microchip"
                    class="text-4xl"
                />
            </div>

            <FProgressBar
                :progress="progress"
                show-text
            />

            <div class="nodes-progress mt-3">
                <div class="flex flex-row items-center gap-1 text-fg-muted text-xs mb-1">
                    <VCIcon name="fa6-solid:hospital" />
                    <span>Nodes</span>
                </div>

                <FAnalysisNodeExecutionList :entity="entity" />
            </div>
        </div>
    </div>
</template>
