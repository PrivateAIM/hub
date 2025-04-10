<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import {
    defineComponent,
    ref,
} from 'vue';
import { FAnalysisPermissionAssignments } from '../../analysis-permission/FAnalysisPermissionAssignments';
import { FPagination, FSearch } from '../../utility';

const NAME_PREFIX = '~analysis_';

export default defineComponent({
    components: { FPagination, FSearch, FAnalysisPermissionAssignments },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
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
    <div>
        <h6>
            <i class="fa fa-key" /> Permissions
        </h6>
    </div>
    <FAnalysisPermissionAssignments
        ref="vNode"
        :query="{ filters }"
        :entity-id="entity.id"
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
</template>
