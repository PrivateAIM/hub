<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis, AnalysisNode } from '@privateaim/core';
import {
    AnalysisBuildStatus,
    AnalysisNodeRunStatus,
    AnalysisRunStatus,
} from '@privateaim/core';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import { computed, defineComponent, toRef } from 'vue';
import FAnalysisNodeRunStatus from './FAnalysisNodeRunStatus';
import FAnalysisNodes from './FAnalysisNodes';

export default defineComponent({
    components: { FAnalysisNodes, FAnalysisNodeRunStatus },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        withHeader: {
            type: Boolean,
            default: false,
        },
        elementType: {
            type: String,
            default: 'steps',
        },
    },
    setup(props) {
        const entity = toRef(props, 'entity');

        const query : BuildInput<AnalysisNode> = {
            filters: {
                analysis_id: entity.value.id,
            },
            sort: {
                index: 'ASC',
            },
        };

        const progressPercentage = computed(() => {
            if (entity.value.build_status !== AnalysisBuildStatus.FINISHED) {
                return 0;
            }

            return 100;
        });

        return {
            query,
            progressPercentage,
            analysisRunStatus: AnalysisRunStatus,
            analysisNodeRunStatus: AnalysisNodeRunStatus,
        };
    },
});
</script>
<template>
    <div>
        <template v-if="elementType === 'steps'">
            <div class="train-stations-progress">
                <FAnalysisNodes
                    :header="false"
                    :query="query"
                    :no-more="false"
                    :realm-id="entity.realm_id"
                    :source-id="entity.id"
                >
                    <template #body="props">
                        <template
                            v-for="(item) in props.data"
                            :key="item.id"
                        >
                            <div
                                class="d-flex flex-column progress-step"
                            >
                                <div
                                    class="d-flex justify-content-center icon-circle text-light p-1"
                                    :class="{
                                        'bg-secondary': !item.run_status,
                                        'bg-dark': item.run_status === analysisNodeRunStatus.DEPARTED,
                                        'active': item.run_status === analysisNodeRunStatus.ARRIVED
                                    }"
                                >
                                    <span class="icon">{{ item.node.name }}</span>
                                </div>
                                <div class="mt-1">
                                    <strong>Status</strong>
                                </div>
                                <div>
                                    <FAnalysisNodeRunStatus :status="item.run_status" />
                                </div>
                            </div>
                        </template>
                    </template>
                </FAnalysisNodes>
            </div>
        </template>
        <template v-else>
            <div class="progress bg-white">
                <div
                    class="progress-bar"
                    :class="{
                        'bg-dark': entity.run_status !== analysisRunStatus.FINISHED,
                        'bg-success': entity.run_status === analysisRunStatus.FINISHED
                    }"
                    :style="{width: progressPercentage + '%'}"
                    :aria-valuenow="progressPercentage"
                    aria-valuemin="0"
                    aria-valuemax="100"
                />
            </div>
        </template>
    </div>
</template>
