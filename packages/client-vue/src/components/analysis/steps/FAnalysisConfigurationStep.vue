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

        const progress = computed(() => {
            let current = 0;

            if (props.entity.configuration_entrypoint_valid) {
                current++;
            }

            if (props.entity.configuration_image_valid) {
                current++;
            }

            if (props.entity.configuration_nodes_valid) {
                current++;
            }

            if (current === 0) {
                return 0;
            }

            return Math.floor((current / 3) * 100);
        });

        return {
            handleUpdated,
            handleFailed,
            handleExecuted,

            passed,
            progress,
        };
    },
});
</script>
<template>
    <div class="card-grey card">
        <div class="card-header">
            <div class="title d-flex flex-row">
                <div>
                    Configuration
                </div>
                <div class="ms-auto">
                    <template v-if="passed">
                        <span class="text-success">
                            <i class="fa fa-check" />
                        </span>
                    </template>
                    <template v-else>
                        <span class="text-danger">
                            <i class="fa fa-times" />
                        </span>
                    </template>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="d-flex flex-column h-100">
                <div class="text-center mb-3">
                    <i class="fas fa-gear fa-4x" />
                </div>
                <div class="progress bg-white">
                    <div
                        class="progress-bar"
                        :class="'bg-success'"
                        :style="{width: progress + '%'}"
                        :aria-valuenow="progress"
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        {{ progress }}%
                    </div>
                </div>
                <hr>
                <h6 class="mb-0">
                    Requirements
                </h6>
                <div class="d-flex flex-row gap-1">
                    <div>
                        <strong>
                            <template v-if="nodesLink">
                                <VCLink :to="nodesLink">
                                    Node(s) Assignment
                                </VCLink>
                            </template>
                            <template v-else>
                                Node(s) Assignment
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
                <div>
                    <strong>
                        <strong>
                            <template v-if="imageLink">
                                <VCLink :to="imageLink">
                                    Image
                                </VCLink>
                            </template>
                            <template v-else>
                                Image
                            </template>
                        </strong>
                    </strong>
                </div>
                <div class="d-flex flex-column ms-4">
                    <div class="d-flex flex-row gap-1">
                        <div>
                            <strong>
                                Base
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
                    <div class="d-flex flex-row gap-1">
                        <div>
                            <strong>
                                Entrypoint
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
                </div>

                <div class="mt-auto">
                    <div class="d-flex flex-column gap-1">
                        <div>
                            <FAnalysisCommand
                                :command="'configurationLock'"
                                :with-icon="true"
                                :entity="entity"
                                @executed="(command: string) => handleExecuted('configuration', command)"
                                @updated="handleUpdated"
                                @failed="handleFailed"
                            />
                        </div>
                        <div>
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
                </div>
            </div>
        </div>
    </div>
</template>
