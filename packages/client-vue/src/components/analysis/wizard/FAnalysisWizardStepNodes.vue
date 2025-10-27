<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import {
    defineComponent,
} from 'vue';
import { FAnalysisNodesManager } from '../../analysis-node';

export default defineComponent({
    components: {
        FAnalysisNodesManager,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'failed'],
    setup(props, { emit }) {
        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const handleUpdated = (e: Analysis) => {
            emit('updated', e);
        };

        return {
            handleFailed,
            handleUpdated,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column">
        <div>
            <FAnalysisNodesManager
                :entity="entity"
                @failed="handleFailed"
                @analysis-updated="handleUpdated"
            />
        </div>
    </div>
</template>
