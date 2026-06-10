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
import { FProgressBar } from '../../utility';

export default defineComponent({
    components: {
        FProgressBar,
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
        nodesLink: { type: String },
        imageLink: { type: String },
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
            <div class="title flex flex-row">
                <div>
                    Configuration
                </div>
                <div class="ms-auto">
                    <template v-if="passed">
                        <span class="text-success-600">
                            <VCIcon name="fa6-solid:check" />
                        </span>
                    </template>
                    <template v-else>
                        <span class="text-error-600">
                            <VCIcon name="fa6-solid:xmark" />
                        </span>
                    </template>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="flex flex-col h-full">
                <div class="text-center mb-3">
                    <VCIcon
                        name="fa6-solid:gear"
                        class="text-4xl"
                    />
                </div>
                <FProgressBar
                    :progress="progress"
                    show-text
                />
                <hr>
                <h6 class="mb-0">
                    Requirements
                </h6>
                <div class="flex flex-row gap-1">
                    <FAnalysisConfigurationNodesStep :entity="entity">
                        <template #default="{passed, message}">
                            <div>
                                <strong
                                    :title="message"
                                >
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
                            <span
                                :class="{
                                    'text-success-600': passed,
                                    'text-error-600': !passed,
                                }"
                            >
                                <VCIcon :name="passed ? 'fa6-solid:check' : 'fa6-solid:xmark'" />
                            </span>
                        </template>
                    </FAnalysisConfigurationNodesStep>
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
                <div class="flex flex-col ms-4">
                    <FAnalysisConfigurationImageStep
                        :entity="entity"
                    >
                        <template #default="{passed, message}">
                            <div class="flex flex-row gap-1">
                                <div>
                                    <strong
                                        :title="message"
                                    >
                                        Base
                                    </strong>
                                </div>
                                <div>
                                    <span
                                        :class="{
                                            'text-success-600': passed,
                                            'text-error-600': !passed,
                                        }"
                                    >
                                        <VCIcon :name="passed ? 'fa6-solid:check' : 'fa6-solid:xmark'" />
                                    </span>
                                </div>
                            </div>
                        </template>
                    </FAnalysisConfigurationImageStep>

                    <FAnalysisConfigurationEntrypointStep :entity="entity">
                        <template #default="{passed, message}">
                            <div class="flex flex-row gap-1">
                                <div>
                                    <strong
                                        :title="message"
                                    >
                                        Entrypoint
                                    </strong>
                                </div>
                                <div>
                                    <span
                                        :class="{
                                            'text-success-600': passed,
                                            'text-error-600': !passed,
                                        }"
                                    >
                                        <VCIcon :name="passed ? 'fa6-solid:check' : 'fa6-solid:xmark'" />
                                    </span>
                                </div>
                            </div>
                        </template>
                    </FAnalysisConfigurationEntrypointStep>
                </div>

                <div class="mt-auto">
                    <div class="flex flex-col gap-1">
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
