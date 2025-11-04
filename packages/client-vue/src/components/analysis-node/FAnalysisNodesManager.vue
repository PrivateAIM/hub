<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { isClientErrorWithStatusCode } from '@privateaim/core-http-kit';
import type { Analysis, AnalysisNode } from '@privateaim/core-kit';
import { BModal } from 'bootstrap-vue-next';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import {
    defineComponent, ref, useTemplateRef,
} from 'vue';
import { injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';
import FAnalysisNodeLogs from '../analysis-node-log/FAnalysisNodeLogs.vue';
import FAnalysisNodePicker from './FAnalysisNodePicker.vue';
import FAnalysisNodes from './FAnalysisNodes';
import FAnalysisNodeRunStatus from './FAnalysisNodeRunStatus.vue';

export default defineComponent({
    components: {
        FAnalysisNodePicker, BModal, FAnalysisNodeRunStatus, FAnalysisNodes, FAnalysisNodeLogs,
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
            filters: {
                analysis_id: props.entity.id,
            },
            sort: {
                node: {
                    name: 'ASC',
                },
            },
        };

        const add = () => toggleModal();

        expose({
            add,
        });

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
                        class="d-flex flex-row flex-wrap justify-content-between"
                        :class="{
                            'flex-row': entity.configuration_locked,
                            'flex-column gap-1': !entity.configuration_locked
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
                                <div class="d-flex flex-column gap-2 m-1">
                                    <div class="progress-step d-flex flex-column">
                                        <div class="d-flex flex-row">
                                            <div>
                                                <h6 class="mb-0">
                                                    {{ item.node.name }}

                                                    <small class="text-muted">({{ item.node.type }})</small>
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
                                                    <i class="fa fa-trash" />
                                                </button>
                                            </div>
                                        </div>
                                        <template v-if="item.run_status">
                                            <FAnalysisNodeRunStatus
                                                :status="item.run_status"
                                                :tag="'div'"
                                            >
                                                <template #default="data">
                                                    <div
                                                        class="d-flex justify-content-center status-text text-light p-1"
                                                        :class="'bg-' + data.classSuffix"
                                                    >
                                                        <span class="icon">
                                                            {{ data.statusText }}
                                                        </span>
                                                    </div>
                                                </template>
                                            </FAnalysisNodeRunStatus>
                                        </template>
                                    </div>

                                    <template v-if="item.run_status">
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

        <BModal
            v-model="modal"
            :no-footer="true"
            :size="'lg'"
        >
            <template #header="props">
                <div class="d-flex flex-row w-100">
                    <div>
                        <h5 class="mb-0">
                            <i class="fa fa-city" /> Nodes
                        </h5>
                    </div>
                    <div class="ms-auto">
                        <button
                            type="button"
                            class="btn btn-xs btn-secondary"
                            @click.prevent="props.close()"
                        >
                            <i class="fa fa-times" />
                        </button>
                    </div>
                </div>
            </template>

            <template #default>
                <FAnalysisNodePicker
                    :analysis-id="entity.id"
                    :project-id="entity.project_id"
                    @created="handleCreated"
                    @deleted="handleDeleted"
                    @failed="handleFailed"
                    @updated="handleUpdated"
                />
            </template>
        </BModal>
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
