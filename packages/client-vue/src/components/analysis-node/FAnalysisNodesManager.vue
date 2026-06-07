<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { isClientErrorWithStatusCode } from '@privateaim/core-http-kit';
import type { Analysis, AnalysisNode } from '@privateaim/core-kit';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import {
    defineComponent,
    ref,
    useTemplateRef,
} from 'vue';
import { injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';
import FAnalysisNodeLogs from '../analysis-node-log/FAnalysisNodeLogs.vue';
import FAnalysisNodePicker from './FAnalysisNodePicker.vue';
import FAnalysisNodes from './FAnalysisNodes';
import FAnalysisNodeExecutionStatus from './FAnalysisNodeExecutionStatus.vue';
import { FAnalysisNodeApprovalStatus } from './FAnalysisNodeApprovalStatus';

export default defineComponent({
    components: {
        FAnalysisNodePicker,
        FAnalysisNodeExecutionStatus,
        FAnalysisNodeApprovalStatus,
        FAnalysisNodes,
        FAnalysisNodeLogs,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: [
        'created',
        'updated',
        'deleted',
        'selected',
        'failed',
        'analysisUpdated',
    ],
    setup(props, { emit, expose }) {
        const coreClient = injectCoreHTTPClient();

        const modal = ref(false);
        const toggleModal = () => {
            modal.value = !modal.value;
        };

        const busy = ref<boolean>(false);

        const vNodes = useTemplateRef<typeof FAnalysisNodes>('analysisNodes');
        const vNodesQuery : BuildInput<AnalysisNode> = {
            filters: { analysis_id: props.entity.id },
            sort: { node: { name: 'ASC' } },
        };

        const add = () => toggleModal();

        expose({ add });

        const handleCreated = (entity: AnalysisNode) => {
            if (vNodes.value) {
                vNodes.value.handleCreated(entity);
            }

            if (entity.analysis) {
                emit('analysisUpdated', entity.analysis);
            }

            emit('created', entity);
        };
        const handleDeleted = (entity: AnalysisNode) => {
            if (vNodes.value) {
                vNodes.value.handleDeleted(entity);
            }

            if (entity.analysis) {
                emit('analysisUpdated', entity.analysis);
            }

            emit('deleted', entity);
        };

        const handleUpdated = (entity: AnalysisNode) => {
            if (vNodes.value) {
                vNodes.value.handleUpdated(entity);
            }

            if (entity.analysis) {
                emit('analysisUpdated', entity.analysis);
            }

            emit('updated', entity);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const drop = wrapFnWithBusyState(busy, async (item: AnalysisNode) => {
            try {
                const tmp = await coreClient.analysisNode.delete(item.id);
                handleDeleted(tmp);
            } catch (e) {
                if (isClientErrorWithStatusCode(e, 404)) {
                    handleDeleted(item);
                    return;
                }

                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        return {
            busy,

            modal,
            vNodesQuery,

            drop,

            handleCreated,
            handleDeleted,
            handleFailed,
            handleUpdated,
        };
    },
});
</script>
<template>
    <div>
        <div class="analysis-nodes">
            <FAnalysisNodes
                ref="analysisNodes"
                :header="false"
                :query="vNodesQuery"
                :realm-id="entity.realm_id"
                :source-id="entity.id"
            >
                <template #body="props">
                    <div
                        class="flex flex-row flex-wrap justify-between"
                        :class="{
                            'flex-row': entity.configuration_locked,
                            'flex-col gap-1': !entity.configuration_locked
                        }"
                    >
                        <template
                            v-for="(item) in props.data"
                            :key="item.id"
                        >
                            <div
                                class="col-12"
                                :class="{'col-lg-6': entity.configuration_locked}"
                            >
                                <div class="flex flex-col gap-2 m-1">
                                    <div class="progress-step flex flex-col">
                                        <div class="flex flex-row">
                                            <div>
                                                <h6 class="mb-0">
                                                    {{ item.node.name }}

                                                    <small class="text-fg-muted">({{ item.node.type }})</small>
                                                </h6>
                                            </div>
                                            <div
                                                v-if="!entity.configuration_locked"
                                                class="ms-auto"
                                            >
                                                <button
                                                    :disabled="busy"
                                                    type="button"
                                                    class="btn btn-danger btn-xs"
                                                    @click.prevent="drop(item)"
                                                >
                                                    <VCIcon name="fa6-solid:trash" />
                                                </button>
                                            </div>
                                        </div>
                                        <template v-if="!item.execution_status">
                                            <small class="text-fg-muted">
                                                approval:
                                                <FAnalysisNodeApprovalStatus :status="item.approval_status" />
                                            </small>
                                        </template>
                                        <template v-if="item.execution_status">
                                            <FAnalysisNodeExecutionStatus
                                                :status="item.execution_status"
                                                :tag="'div'"
                                            >
                                                <template #default="data">
                                                    <div
                                                        class="flex justify-center status-text text-light p-1"
                                                        :class="'bg-' + data.classSuffix"
                                                    >
                                                        <span class="icon">
                                                            {{ data.statusText }}
                                                        </span>
                                                    </div>
                                                </template>
                                            </FAnalysisNodeExecutionStatus>
                                        </template>
                                    </div>

                                    <template v-if="item.execution_status">
                                        <div>
                                            <FAnalysisNodeLogs
                                                :analysis-id="item.analysis_id"
                                                :node-id="item.node_id"
                                            />
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </template>
                <template #noMore>
                    No nodes selected for the analysis.
                </template>
            </FAnalysisNodes>
        </div>

        <VCModal v-model:open="modal">
            <VCModalContent class="modal-lg">
                <div class="modal-header">
                    <div class="flex flex-row w-full">
                        <div>
                            <h5 class="mb-0">
                                <VCIcon name="fa6-solid:city" /> Nodes
                            </h5>
                        </div>
                        <div class="ms-auto">
                            <button
                                type="button"
                                class="btn btn-xs btn-secondary"
                                @click.prevent="modal = false"
                            >
                                <VCIcon name="fa6-solid:xmark" />
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <FAnalysisNodePicker
                        :analysis-id="entity.id"
                        :project-id="entity.project_id"
                        @created="handleCreated"
                        @deleted="handleDeleted"
                        @failed="handleFailed"
                        @updated="handleUpdated"
                    />
                </div>
            </VCModalContent>
        </VCModal>
    </div>
</template>
<style>
.analysis-nodes .list-body {
    flex-direction: column;
    /*
    justify-content: space-between;
     */
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.status-text {
    height: 50px;
    font-weight: 600;
    text-transform: capitalize;
    font-size: 1.25rem;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
}
</style>
