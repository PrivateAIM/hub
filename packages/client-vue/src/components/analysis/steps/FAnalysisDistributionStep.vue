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
import { computed, defineComponent } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import FProcessStatus from '../../FProcessStatus.vue';
import { FAnalysisCommand } from '../FAnalysisCommand';

export default defineComponent({
    components: {
        FProcessStatus,
        FAnalysisCommand,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'executed', 'failed'],
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

        const progress = computed(() => {
            if (props.entity.distribution_status === ProcessStatus.EXECUTED) {
                return 100;
            }

            return props.entity.distribution_progress || 0;
        });

        return {
            handleUpdated,
            handleFailed,
            handleExecuted,

            progress,
        };
    },
});
</script>
<template>
    <div class="card-grey card grow">
        <div class="card-header">
            <div class="title flex flex-row">
                <div>
                    3. Distribution
                </div>
                <div class="ms-auto">
                    <FProcessStatus :value="entity.distribution_status">
                        <template #default=" { iconName, iconClass, classSuffix }">
                            <VCIcon
                                :name="iconName"
                                :class="iconClass + ' text-'+ classSuffix"
                            />
                        </template>
                    </FProcessStatus>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="flex flex-col h-full">
                <div class="text-center mb-3">
                    <VCIcon
                        name="fa6-solid:sitemap"
                        class="text-4xl"
                    />
                </div>

                <div class="progress bg-white">
                    <div
                        class="progress-bar"
                        :class="'bg-success-600'"
                        :style="{width: progress + '%'}"
                        :aria-valuenow="progress"
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        {{ progress }}%
                    </div>
                </div>
                <div class="mt-auto">
                    <div class="flex flex-row gap-1">
                        <div>
                            <FAnalysisCommand
                                :command="'distributionStart'"
                                :with-icon="true"
                                :entity="entity"
                                @executed="(command) => handleExecuted('start', command)"
                                @updated="handleUpdated"
                                @failed="handleFailed"
                            />
                        </div>
                        <div>
                            <FAnalysisCommand
                                :command="'distributionCheck'"
                                :with-icon="true"
                                :entity="entity"
                                @executed="(command) => handleExecuted('check', command)"
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
