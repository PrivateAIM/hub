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
import FAnalysisNodeManager from '../../analysis-node/FAnalysisNodeManager.vue';

export default defineComponent({
    components: {
        FAnalysisNodeManager,
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
            <FAnalysisNodeManager
                :entity="entity"
                @failed="handleFailed"
                @analysis-updated="handleUpdated"
            >
                <template #header="props">
                    <div class="d-flex flex-row">
                        <div>
                            <h6>
                                <i class="fa fa-city" /> Nodes
                            </h6>
                        </div>
                        <div class="ms-auto">
                            <button
                                type="button"
                                style="width:120px"
                                class="btn btn-primary btn-xs"
                                @click.prevent="props.add"
                            >
                                <i class="fa fa-plus me-1" /> Add
                            </button>
                        </div>
                    </div>
                </template>
            </FAnalysisNodeManager>
        </div>
    </div>
</template>
