<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { FAnalysisNodesManager } from '@privateaim/client-vue';
import type { Analysis } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent, useTemplateRef } from 'vue';

export default defineComponent({
    components: { FAnalysisNodesManager },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
        },
    },
    setup() {
        const analysisNodes = useTemplateRef<typeof FAnalysisNodesManager | null>('analysisNodes');

        const add = () => {
            if (analysisNodes.value) {
                analysisNodes.value.add();
            }
        };

        return {
            add,
        };
    },
});
</script>
<template>
    <div v-if="entity">
        <div class="card-grey card mb-3">
            <div class="card-header">
                <div class="d-flex flex-row w-100">
                    <div>
                        <span class="title">Nodes</span>
                    </div>
                    <template v-if="!entity.configuration_locked">
                        <div class="ms-auto">
                            <button
                                style="width: 120px"
                                type="button"
                                class="btn btn-primary btn-xs"
                                @click.prevent="add"
                            >
                                <i class="fa fa-plus me-1" /> Add
                            </button>
                        </div>
                    </template>
                </div>
            </div>
            <div class="card-body">
                <FAnalysisNodesManager
                    ref="analysisNodes"
                    :entity="entity"
                />
            </div>
        </div>
    </div>
</template>
