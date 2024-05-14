<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis, AnalysisNode, MasterImage } from '@privateaim/core';
import type { PropType } from 'vue';
import {
    defineComponent, ref,
} from 'vue';
import FProjectNodes from '../../project-node/FProjectNodes';
import FMasterImagePicker from '../../master-image/FMasterImagePicker';
import FAnalysisNodes from '../../analysis-node/FAnalysisNodes';
import FAnalysisNodeAssignAction from '../../analysis-node/FAnalysisNodeAssignAction';
import { injectCoreHTTPClient } from '../../../core';
import { FPagination, FSearch } from '../../utility';

export default defineComponent({
    components: {
        ListPagination: FPagination,
        ListSearch: FSearch,
        FAnalysisNodeAssignAction,
        FAnalysisNodes,
        FMasterImagePicker,
        FProjectNodes,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'failed'],
    setup(props, { emit }) {
        const apiClient = injectCoreHTTPClient();
        const handleMasterImageSelected = async (item: MasterImage) => {
            try {
                const response = await apiClient.analysis.update(props.entity.id, {
                    master_image_id: item ? item.id : null as string,
                });

                emit('updated', response);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        };

        const FAnalysisNodes = ref<null | Record<string, any>>(null);

        const handleAnalysisNodeCreated = (item: AnalysisNode) => {
            if (FAnalysisNodes.value) {
                FAnalysisNodes.value.handleCreated(item);
            }

            if (item.analysis) {
                emit('updated', item.analysis);
            }
        };

        const handleAnalysisNodeDeleted = (item: AnalysisNode) => {
            if (FAnalysisNodes.value) {
                FAnalysisNodes.value.handleDeleted(item);
            }

            if (item.analysis) {
                emit('updated', item.analysis);
            }
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            handleFailed,
            handleMasterImageSelected,
            handleAnalysisNodeCreated,
            handleAnalysisNodeDeleted,
            FAnalysisNodes,
        };
    },
});
</script>
<template>
    <div>
        <div class="mb-2">
            <h6><i class="fa fa-compact-disc" /> MasterImage</h6>
            <div class="mb-2">
                <FMasterImagePicker
                    :entity-id="entity.master_image_id"
                    @selected="handleMasterImageSelected"
                />
            </div>
        </div>

        <hr>

        <div>
            <h6><i class="fa fa-city" /> Nodes</h6>

            <div class="row">
                <div class="col-12 col-xl-6">
                    <FProjectNodes
                        ref="FProjectNodes"
                        :realm-id="entity.realm_id"
                        :direction="'out'"
                        :query="{filters: {project_id: entity.project_id}}"
                    >
                        <template #header="props">
                            <span>Nodes <span class="text-info">available</span></span>

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

                        <template #itemActions="props">
                            <FAnalysisNodeAssignAction
                                :node-id="props.data.node_id"
                                :analysis-id="entity.id"
                                :realm-id="entity.realm_id"
                                @created="handleAnalysisNodeCreated"
                                @deleted="handleAnalysisNodeDeleted"
                                @failed="handleFailed"
                            />
                        </template>
                    </FProjectNodes>
                </div>
                <div class="col-12 col-xl-6">
                    <FAnalysisNodes
                        ref="FAnalysisNodes"
                        :realm-id="entity.realm_id"
                        :direction="'out'"
                        :query="{filters: {analysis_id: entity.id}}"
                    >
                        <template #header>
                            <span>Nodes <span class="text-success">selected</span></span>
                        </template>
                    </FAnalysisNodes>
                </div>
            </div>
        </div>
    </div>
</template>
