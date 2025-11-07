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
                <strong>4. Execution</strong>
            </div>
            <div>
                <FProcessStatus :value="entity.execution_status">
                    <template #default=" { iconClass, classSuffix }">
                        <i :class="iconClass + ' text-'+ classSuffix" />
                    </template>
                </FProcessStatus>
            </div>
        </div>
    </div>
</template>
