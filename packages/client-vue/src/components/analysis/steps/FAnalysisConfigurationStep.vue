<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type { Analysis, AnalysisBucketFile } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import { injectCoreHTTPClient } from '../../../core';
import FAnalysis from '../FAnalysis';
import FAnalysisConfigurationImageStep from './FAnalysisConfigurationImageStep.vue';
import FAnalysisConfigurationFilesStep from './FAnalysisConfigurationFilesStep.vue';
import FAnalysisConfigurationNodesStep from './FAnalysisConfigurationNodesStep.vue';

export default defineComponent({
    components: {
        FAnalysisConfigurationNodesStep,
        FAnalysisConfigurationFilesStep,
        FAnalysisConfigurationImageStep,
        FAnalysis,
    },
    props: {
        entityId: {
            type: String,
            required: true,
        },
        entity: {
            type: Object as PropType<Analysis>,
        },
    },
    setup(props) {
        const httpClient = injectCoreHTTPClient();

        const resolved = ref(false);
        const busy = ref(false);

        const files = ref<AnalysisBucketFile[]>([]);
        const hasEntrypoint = computed(() => files.value
            .filter((analysisBucketFile) => analysisBucketFile.root &&
                analysisBucketFile.bucket.type === AnalysisBucketType.CODE)
            .length > 0);

        const message = computed(() => {
            if (busy.value || !resolved.value) {
                return null;
            }

            if (!hasEntrypoint.value) {
                return 'An entrypoint file must be selected.';
            }

            return null;
        });

        const passed = computed(() => !busy.value && hasEntrypoint.value);

        const resolve = async () => {
            if (busy.value) return;

            busy.value = true;

            try {
                const { data } = await httpClient.analysisBucketFile.getMany({
                    filters: {
                        analysis_id: props.entityId,
                        root: true,
                    },
                    relations: {
                        bucket: true,
                    },
                });

                files.value = data;
                // todo: get all nodes + check if a aggregator node is one of them
            } finally {
                resolved.value = true;
                busy.value = false;
            }
        };

        Promise
            .resolve()
            .then(() => resolve());

        return {
            resolved,
            passed,
            message,
            hasEntrypoint,
        };
    },
});
</script>
<template>
    <FAnalysis :entity-id="entityId">
        <template #default="{data }">
            <div>
                <div class="d-flex flex-row gap-1">
                    <div>
                        <strong>1. Configuration</strong>
                    </div>
                    <div>
                        <template v-if="!resolved">
                            <i class="fa fa-rotate fa-spin" />
                        </template>
                        <template v-else>
                            <template v-if="passed">
                                <span class="text-success">
                                    <i class="fa fa-check" />
                                </span>
                            </template>
                            <template v-else>
                                <span class="text-danger">
                                    <i class="fa fa-times" />
                                </span>
                                <small>( {{ message }} )</small>
                            </template>
                        </template>
                    </div>
                </div>
                <div class="d-flex flex-column ms-3">
                    <div class="d-flex flex-row gap-1">
                        <div>
                            <strong>1.1 Nodes</strong>
                        </div>
                        <div>
                            <FAnalysisConfigurationNodesStep :entity-id="data.id">
                                <template #unresolved>
                                    <i class="fa fa-rotate fa-spin" />
                                </template>
                                <template #valid>
                                    <span class="text-success">
                                        <i class="fa fa-check" />
                                    </span>
                                </template>
                                <template #invalid="{ message }">
                                    <span class="text-danger">
                                        <i class="fa fa-times" />
                                    </span>
                                    <small>( {{ message }} )</small>
                                </template>
                            </FAnalysisConfigurationNodesStep>
                        </div>
                    </div>
                    <div class="d-flex flex-row gap-1">
                        <div>
                            <strong>1.2 Code</strong>
                        </div>
                        <div>
                            <FAnalysisConfigurationFilesStep :entity-id="data.id">
                                <template #unresolved>
                                    <i class="fa fa-rotate fa-spin" />
                                </template>
                                <template #valid>
                                    <span class="text-success">
                                        <i class="fa fa-check" />
                                    </span>
                                </template>
                                <template #invalid="{ message }">
                                    <span class="text-danger">
                                        <i class="fa fa-times" />
                                    </span>
                                    <small>( {{ message }} )</small>
                                </template>
                            </FAnalysisConfigurationFilesStep>
                        </div>
                    </div>
                    <div class="d-flex flex-row gap-1">
                        <div>
                            <strong>1.3 Image</strong>
                        </div>
                        <div>
                            <FAnalysisConfigurationImageStep
                                :entity-id="data.id"
                                :entity="data"
                            >
                                <template #unresolved>
                                    <i class="fa fa-rotate fa-spin" />
                                </template>
                                <template #valid>
                                    <span class="text-success">
                                        <i class="fa fa-check" />
                                    </span>
                                </template>
                                <template #invalid="{ message }">
                                    <span class="text-danger">
                                        <i class="fa fa-times" />
                                    </span>
                                    <small>( {{ message }} )</small>
                                </template>
                            </FAnalysisConfigurationImageStep>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </FAnalysis>
</template>
