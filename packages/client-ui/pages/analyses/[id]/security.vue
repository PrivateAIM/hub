<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { FAnalysisPermissionAssignments, FPagination, FSearch } from '@privateaim/client-vue';
import type { Analysis } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';

const NAME_PREFIX = '~analysis_self_';

export default defineComponent({
    components: {
        FSearch,
        FPagination,
        FAnalysisPermissionAssignments,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
        },
    },
    emits: ['failed'],
    setup() {
        const vNode = ref<typeof FAnalysisPermissionAssignments | null>(null);
        const filters : Record<string, unknown> = {
            name: NAME_PREFIX,
        };

        const load = async (meta: any) => {
            if (vNode.value) {
                const name = `${NAME_PREFIX}${meta.filters.name.substring(1)}`;
                filters.name = name;
                vNode.value.load({
                    ...meta,
                    filters: {
                        name,
                    },
                });
            }
        };

        return {
            filters,
            load,
            vNode,
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
                        <span class="title">Permissions</span>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <FAnalysisPermissionAssignments
                    ref="vNode"
                    :query="{ filters }"
                    :entity-id="entity.id"
                    :readonly="entity.configuration_locked"
                >
                    <template #header="props">
                        <FSearch
                            :load="load"
                            :meta="props.meta"
                        />
                    </template>
                    <template #footer="props">
                        <FPagination
                            :busy="props.busy"
                            :meta="props.meta"
                            :load="props.load"
                        />
                    </template>
                </FAnalysisPermissionAssignments>
            </div>
        </div>
    </div>
</template>
