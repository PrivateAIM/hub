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
import { VCLink } from '@vuecs/link';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import FAnalysisConfigurationImageStep from './FAnalysisConfigurationImageStep.vue';
import FAnalysisConfigurationEntrypointStep from './FAnalysisConfigurationEntrypointStep.vue';
import FAnalysisConfigurationNodesStep from './FAnalysisConfigurationNodesStep.vue';
import { FAnalysisCommand } from '../FAnalysisCommand';

export default defineComponent({
    components: {
        FAnalysisCommand,
        FAnalysisConfigurationNodesStep,
        FAnalysisConfigurationEntrypointStep,
        FAnalysisConfigurationImageStep,
        VCLink,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        nodesLink: {
            type: String,
        },
        codeLink: {
            type: String,
        },
        imageLink: {
            type: String,
        },
    },
    emits: ['updated', 'executed', 'failed', 'jumpTo'],
    setup(props, { emit }) {
        const handleExecuted = (type: string, command: string) => {
            emit('executed', type, command);
        };
        const handleUpdated = (item: Analysis) => {
            emit('updated', item);
        };
        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const passed = computed(() => props.entity &&
            props.entity.configuration_entrypoint_valid &&
                props.entity.configuration_image_valid &&
                props.entity.configuration_nodes_valid);

        const message = computed(() => {
            if (passed.value) {
                return null;
            }

            return 'The configuration is not completed yet.';
        });

        return {
            handleUpdated,
            handleFailed,
            handleExecuted,

            passed,
            message,
        };
    },
});
</script>
<template>
    <div>
        <div class="d-flex flex-row gap-1">
            <div>
                <strong>1. Configuration</strong>
            </div>
            <div>
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
            </div>
        </div>
        <div class="d-flex flex-column ms-3">
            <div class="d-flex flex-row gap-1">
                <div>
                    <strong>
                        <template v-if="nodesLink">
                            <VCLink :to="nodesLink">
                                1.1 Nodes
                            </VCLink>
                        </template>
                        <template v-else>
                            1.1 Nodes
                        </template>
                    </strong>
                </div>
                <div>
                    <FAnalysisConfigurationNodesStep :entity="entity">
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
                    <strong>
                        <template v-if="codeLink">
                            <VCLink :to="codeLink">
                                1.2 Code
                            </VCLink>
                        </template>
                        <template v-else>
                            1.2 Code
                        </template>
                    </strong>
                </div>
                <div>
                    <FAnalysisConfigurationEntrypointStep :entity="entity">
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
                    </FAnalysisConfigurationEntrypointStep>
                </div>
            </div>
            <div class="d-flex flex-row gap-1">
                <div>
                    <strong>
                        <template v-if="codeLink">
                            <VCLink :to="codeLink">
                                1.3 Image
                            </VCLink>
                        </template>
                        <template v-else>
                            1.3 Image
                        </template>
                    </strong>
                </div>
                <div>
                    <FAnalysisConfigurationImageStep
                        :entity="entity"
                    >
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
        <div class="mt-1">
            <FAnalysisCommand
                :command="'configurationLock'"
                :with-icon="true"
                :entity="entity"
                @executed="(command: string) => handleExecuted('configuration', command)"
                @updated="handleUpdated"
                @failed="handleFailed"
            />
            <FAnalysisCommand
                :command="'configurationUnlock'"
                :with-icon="true"
                :entity="entity"
                @executed="(command: string) => handleExecuted('configuration', command)"
                @updated="handleUpdated"
                @failed="handleFailed"
            />
        </div>
    </div>
</template>
