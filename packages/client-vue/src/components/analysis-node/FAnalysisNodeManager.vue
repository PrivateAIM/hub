<script lang="ts">
import {
    type PropType,
    computed,
    defineComponent,
    ref,
} from 'vue';
import type { Analysis, AnalysisNode } from '@privateaim/core-kit';
import type { BuildInput } from 'rapiq';
import { BModal } from 'bootstrap-vue-next';
import { isClientErrorWithStatusCode } from '@privateaim/core-http-kit';
import { injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';
import type { FAnalysisBucketFiles } from '../analysis-bucket-file';
import FAnalysisNodes from './FAnalysisNodes';
import FAnalysisNodeAssignAction from './FAnalysisNodeAssignAction';
import { FPagination as ListPagination, FSearch as ListSearch } from '../utility';
import FProjectNodes from '../project-node/FProjectNodes';

export default defineComponent({
    components: {
        FProjectNodes,
        ListPagination,
        ListSearch,
        FAnalysisNodeAssignAction,
        FAnalysisNodes,
        BModal,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['created', 'updated', 'deleted', 'selected', 'failed', 'analysisUpdated'],
    setup(props, { emit }) {
        const coreClient = injectCoreHTTPClient();

        const modal = ref(false);
        const toggleModal = () => {
            modal.value = !modal.value;
        };

        const busy = ref<boolean>(false);

        const vNode = ref<null | typeof FAnalysisBucketFiles>(null);
        const VNodeQuery = computed<BuildInput<AnalysisNode>>(() => ({
            filters: {
                analysis_id: props.entity.id,
            },
            sort: {
                node: {
                    name: 'ASC',
                },
            },
        }));

        const vProjectNodesNode = ref<null | typeof FProjectNodes>(null);

        const handleCreated = (entity: AnalysisNode) => {
            if (vNode.value) {
                vNode.value.handleCreated(entity);
            }

            if (entity.analysis) {
                emit('analysisUpdated', entity.analysis);
            }

            emit('created', entity);
        };
        const handleDeleted = (entity: AnalysisNode) => {
            if (vNode.value) {
                vNode.value.handleDeleted(entity);
            }

            if (entity.analysis) {
                emit('analysisUpdated', entity.analysis);
            }

            emit('deleted', entity);
        };

        const handleUpdated = (entity: AnalysisNode) => {
            if (vNode.value) {
                vNode.value.handleUpdated(entity);
            }

            if (entity.analysis) {
                emit('analysisUpdated', entity.analysis);
            }

            emit('updated', entity);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const handleSelected = () => {
            emit('selected');

            toggleModal();
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

            drop,

            handleCreated,
            handleDeleted,
            handleUpdated,
            handleFailed,
            handleSelected,

            vNode,
            VNodeQuery,

            vProjectNodesNode,

            modal,
            toggleModal,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column gap-1">
        <div>
            <FAnalysisNodes
                ref="vNode"
                :query="VNodeQuery"
                :realm-id="entity.realm_id"
                :direction="'out'"
                @created="handleCreated"
                @updated="handleUpdated"
                @deleted="handleDeleted"
            >
                <template #header="props">
                    <slot
                        name="header"
                        :add="toggleModal"
                    />

                    <ListSearch
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
                            <button
                                :disabled="busy"
                                type="button"
                                class="btn btn-danger btn-xs"
                                @click.prevent="drop(props.data)"
                            >
                                <i class="fa fa-trash" />
                            </button>
                        </div>
                    </div>
                </template>
                <template #footer="props">
                    <ListPagination
                        :load="props.load"
                        :meta="props.meta"
                    />
                </template>
            </FAnalysisNodes>
        </div>
        <div>
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

                <FProjectNodes
                    ref="vProjectNodesNode"
                    :realm-id="entity.realm_id"
                    :direction="'out'"
                    :query="{
                        filters: {
                            project_id: entity.project_id
                        },
                        sort: {
                            node: {
                                name: 'ASC'
                            }
                        }
                    }"
                >
                    <template #header="props">
                        <ListSearch
                            :load="props.load"
                            :meta="props.meta"
                        />
                    </template>
                    <template #footer="props">
                        <ListPagination
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
                                <template v-if="modal">
                                    <FAnalysisNodeAssignAction
                                        :key="props.data.node_id"
                                        :node-id="props.data.node_id"
                                        :analysis-id="entity.id"
                                        :realm-id="entity.realm_id"
                                        @created="handleCreated"
                                        @deleted="handleDeleted"
                                        @failed="handleFailed"
                                    />
                                </template>
                            </div>
                        </div>
                    </template>
                </FProjectNodes>

                <!-- todo AnalysisNodePicker -->
            </BModal>
        </div>
    </div>
</template>
