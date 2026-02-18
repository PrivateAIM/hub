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

export default defineComponent({
    components: {
        FProcessStatus,
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
        };
    },
});
</script>
<template>
    <div class="card-grey card flex-grow-1">
        <div class="card-header">
            <div class="title d-flex flex-row">
                <div>
                    4. Execution
                </div>
                <div class="ms-auto">
                    <FProcessStatus :value="entity.execution_status">
                        <template #default=" { iconClass, classSuffix }">
                            <i :class="iconClass + ' text-'+ classSuffix" />
                        </template>
                    </FProcessStatus>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="text-center mb-3">
                <i class="fas fa-microchip fa-4x" />
            </div>

            <div class="progress bg-white">
                <div
                    class="progress-bar"
                    :class="'bg-success'"
                    :style="{width: progress + '%'}"
                    :aria-valuenow="progress"
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                    {{ progress }}%
                </div>
            </div>
        </div>
    </div>
</template>
