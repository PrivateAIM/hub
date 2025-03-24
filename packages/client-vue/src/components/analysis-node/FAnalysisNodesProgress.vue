<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis, AnalysisNode } from '@privateaim/core-kit';
import {
    AnalysisBuildStatus,
    AnalysisNodeRunStatus,
    AnalysisRunStatus,
} from '@privateaim/core-kit';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import { computed, defineComponent, toRef } from 'vue';
import FAnalysisNodes from './FAnalysisNodes';

export default defineComponent({
    components: { FAnalysisNodes },
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
            <div class="analysis-nodes">
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
                                class="d-flex flex-column progress-step flex-grow-1"
                            >
                                <div class="text-left">
                                    <h6>{{ item.node.name }}</h6>
                                </div>
                                <div
                                    class="d-flex justify-content-center icon-circle text-light p-1"
                                    :class="{
                                        'bg-secondary': !item.run_status,
                                        'bg-primary': item.run_status === analysisNodeRunStatus.STARTED ||
                                            item.run_status === analysisNodeRunStatus.STARTING,
                                        'bg-success': item.run_status === analysisNodeRunStatus.FINISHED,
                                        'bg-dark': item.run_status === analysisNodeRunStatus.RUNNING,
                                        'bg-warning': item.run_status === analysisNodeRunStatus.STOPPED ||
                                            item.run_status === analysisNodeRunStatus.STOPPING,
                                        'bg-danger': item.run_status === analysisNodeRunStatus.FAILED
                                    }"
                                >
                                    <span class="icon">
                                        {{ item.run_status || 'none' }}
                                    </span>
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
<style>
.analysis-nodes .list-body {
    flex-direction: row;
    /*
    justify-content: space-between;
     */
    display: flex;
    gap: 1rem;
}

.progress-with-circle {
    position: relative;
    top: 40px;
    height: 4px;
}

.progress-with-circle .progress-bar {
    box-shadow: none;
    -webkit-transition: width .3s ease;
    -o-transition: width .3s ease;
    transition: width .3s ease;
    height: 100%;
}

.progress-step {
    display: flex;
    justify-content: center;
    align-content: center;
    min-width: 100px;
}

.icon-circle {
    font-weight: 600;
    height: 50px;
    background-color: #ececec;
    position: relative;
    border-radius: 5px;
    opacity: 0.9;
}

.icon-circle .icon {
    text-transform: capitalize;
    font-size: 1.25rem;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
}
</style>
