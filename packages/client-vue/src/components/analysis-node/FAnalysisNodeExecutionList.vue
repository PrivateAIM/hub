<!--
  - Copyright (c) 2026.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { Analysis, AnalysisNode } from '@privateaim/core-kit';
import type { QueryBuildInput } from '@rapiq/core';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FProgressBar } from '../utility';
import { resolveTextColorClass } from '../../core';
import FAnalysisNodes from './FAnalysisNodes';
import FAnalysisNodeExecutionStatus from './FAnalysisNodeExecutionStatus.vue';
import {
    getAnalysisNodeExecutionProgress,
    getAnalysisNodeExecutionProgressColor,
} from './utils';

export default defineComponent({
    components: {
        FAnalysisNodes,
        FAnalysisNodeExecutionStatus,
        FProgressBar,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    setup(props) {
        const query : QueryBuildInput<AnalysisNode, 3> = {
            filters: { analysis_id: props.entity.id },
            sort: 'node.name',
        };

        return {
            query,
            nodeProgress: getAnalysisNodeExecutionProgress,
            nodeProgressColor: getAnalysisNodeExecutionProgressColor,
            resolveTextColorClass,
        };
    },
});
</script>
<template>
    <FAnalysisNodes
        :header="false"
        :query="query"
        :realm-id="entity.realm_id"
        :source-id="entity.id"
    >
        <template #body="props">
            <div class="node-execution-list flex flex-col gap-2">
                <template
                    v-for="item in props.data"
                    :key="item.id"
                >
                    <div class="node-execution-item flex flex-col gap-1">
                        <div class="flex flex-row items-center gap-1 min-w-0">
                            <span
                                class="node-execution-name flex-1 min-w-0 truncate text-sm"
                                :title="item.node ? item.node.name : item.node_id"
                            >
                                {{ item.node ? item.node.name : item.node_id }}
                                <small
                                    v-if="item.node"
                                    class="text-fg-muted"
                                >({{ item.node.type }})</small>
                            </span>
                            <FAnalysisNodeExecutionStatus
                                :status="item.execution_status"
                                tag="span"
                            >
                                <template #default="data">
                                    <span
                                        class="node-execution-status shrink-0 text-xs"
                                        :class="resolveTextColorClass(data.classSuffix)"
                                    >
                                        {{ data.statusText }}
                                    </span>
                                </template>
                            </FAnalysisNodeExecutionStatus>
                        </div>
                        <FProgressBar
                            :progress="nodeProgress(item)"
                            :color-class="nodeProgressColor(item)"
                            show-text
                        />
                    </div>
                </template>
            </div>
        </template>
        <template #noMore>
            <div class="text-fg-muted text-xs text-center">
                No nodes selected for the analysis.
            </div>
        </template>
    </FAnalysisNodes>
</template>
<style scoped>
.node-execution-list {
    max-height: 18rem;
    overflow-y: auto;
    padding-right: 0.25rem;
}
</style>
