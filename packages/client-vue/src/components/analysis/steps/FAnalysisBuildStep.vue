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
import { humanFileSize } from '@privateaim/kit';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import FProcessStatus from '../../FProcessStatus.vue';
import { FAnalysisCommand } from '../FAnalysisCommand';
import FAnalysisBuildNodesStep from './FAnalysisBuildNodesStep.vue';

export default defineComponent({
    components: {
        FAnalysisBuildNodesStep,
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
        const progress = computed(() => props.entity.build_progress || 0);

        const handleExecuted = (type: string, command: string) => {
            emit('executed', type, command);
        };
        const handleUpdated = (item: Analysis) => {
            emit('updated', item);
        };
        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const size = computed(() => {
            if (props.entity.build_size) {
                return humanFileSize(props.entity.build_size);
            }

            return null;
        });

        return {
            progress,
            handleUpdated,
            handleFailed,
            handleExecuted,
            size,
        };
    },
});
</script>
<template>
    <div class="card-grey card flex-grow-1">
        <div class="card-header">
            <div class="title d-flex flex-row">
                <div>
                    Build
                </div>
                <div class="ms-auto">
                    <FProcessStatus :value="entity.build_status">
                        <template #default=" { iconClass, classSuffix }">
                            <i :class="iconClass + ' text-'+ classSuffix" />
                        </template>
                    </FProcessStatus>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="d-flex flex-column h-100">
                <div class="text-center mb-3">
                    <i class="fas fa-hammer fa-4x" />
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

                <div class="d-flex flex-column gap-2">
                    <div>
                        <h6 class="mb-0">
                            Requirements
                        </h6>
                        <div class="d-flex flex-row gap-1">
                            <div>
                                <strong>
                                    Node(s) Approval
                                </strong>
                            </div>
                            <div>
                                <FAnalysisBuildNodesStep :entity="entity">
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
                                </FAnalysisBuildNodesStep>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h6 class="mb-0">
                            Info
                        </h6>
                        <div class="d-flex flex-column">
                            <div class="d-flex flex-row gap-1">
                                <div>
                                    <strong>OS</strong>
                                </div>
                                <div>
                                    <template v-if="entity.build_os">
                                        {{ entity.build_os }}
                                        <i
                                            class="fa-brands"
                                            :class="'fa-' + entity.build_os"
                                        />
                                    </template>
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-1">
                                <div>
                                    <strong>Hash</strong>
                                </div>
                                <div style="word-break: break-all;">
                                    <template v-if="entity.build_hash">
                                        {{ entity.build_hash }}
                                    </template>
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-1">
                                <div>
                                    <strong>Size</strong>
                                </div>
                                <div>
                                    <template v-if="size">
                                        {{ size }}
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-auto">
                    <div class="d-flex flex-row gap-1 ">
                        <div>
                            <FAnalysisCommand
                                :command="'buildStart'"
                                :with-icon="true"
                                :entity="entity"
                                @executed="(command) => handleExecuted('start', command)"
                                @updated="handleUpdated"
                                @failed="handleFailed"
                            />
                        </div>
                        <div>
                            <FAnalysisCommand
                                :command="'buildCheck'"
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
