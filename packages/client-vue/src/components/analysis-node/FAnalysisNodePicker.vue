<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { AnalysisNode } from '@privateaim/core-kit';
import { defineComponent } from 'vue';

import FProjectNodes from '../project-node/FProjectNodes';
import { FPagination, FSearch } from '../utility';
import FAnalysisNodeAssignAction from './FAnalysisNodeAssignAction';

export default defineComponent({
    components: {
        FPagination,
        FSearch,
        FProjectNodes,
        FAnalysisNodeAssignAction,
    },
    props: {
        realmId: {
            type: String,
        },
        projectId: {
            type: String,
            required: true,
        },
        analysisId: {
            type: String,
            required: true,
        },
    },
    emits: ['created', 'updated', 'failed', 'deleted'],
    setup(_, { emit }) {
        const created = (input: AnalysisNode) => {
            emit('created', input);
        };

        const updated = (input: AnalysisNode) => {
            emit('updated', input);
        };

        const deleted = (input: AnalysisNode) => {
            emit('deleted', input);
        };

        const failed = (input: AnalysisNode) => {
            emit('failed', input);
        };

        return {
            created,
            updated,
            failed,
            deleted,
        };
    },
});
</script>
<template>
    <FProjectNodes
        ref="vNode"
        :realm-id="realmId"
        :direction="'out'"
        :query="{
            filters: {
                project_id: projectId
            },
            sort: {
                node: {
                    name: 'ASC'
                }
            }
        }"
    >
        <template #header="props">
            <FSearch
                :load="props.load"
                :meta="props.meta"
            />
        </template>
        <template #footer="props">
            <FPagination
                :load="props.load"
                :meta="props.meta"
            />
        </template>

        <template #item="props">
            <div class="d-flex flex-row w-100">
                <div>
                    {{ props.data.node.name }} <span class="text-muted">({{ props.data.node.type }})</span>
                </div>
                <div class="ms-auto">
                    <FAnalysisNodeAssignAction
                        :key="props.data.node_id"
                        :node-id="props.data.node_id"
                        :analysis-id="analysisId"
                        :realm-id="realmId"
                        @created="created"
                        @deleted="deleted"
                        @failed="failed"
                    />
                </div>
            </div>
        </template>
    </FProjectNodes>
</template>
