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
import { ProcessStatus, humanFileSize } from '@privateaim/kit';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import FProcessStatus from '../../FProcessStatus.vue';
import { FAnalysisCommand } from '../FAnalysisCommand';
import FAnalysisBuildNodesStep from './FAnalysisBuildNodesStep.vue';
import { FProgressBar } from '../../utility';
import { resolveTextColorClass } from '../../../core';

export default defineComponent({
    components: {
        FProgressBar,
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
        const progress = computed(() => {
            if (props.entity.build_status === ProcessStatus.EXECUTED) {
                return 100;
            }

            return props.entity.build_progress || 0;
        });

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
            resolveTextColorClass,
        };
    },
});
</script>
<template>
    <div class="card-grey card grow">
        <div class="card-header">
            <div class="title flex flex-row">
                <div>
                    Build
                </div>
                <div class="ms-auto">
                    <FProcessStatus :value="entity.build_status">
                        <template #default=" { iconName, iconClass, classSuffix }">
                            <VCIcon
                                :name="iconName"
                                :class="[iconClass, resolveTextColorClass(classSuffix)]"
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
                        name="fa6-solid:hammer"
                        class="text-4xl"
                    />
                </div>
                <FProgressBar
                    :progress="progress"
                    show-text
                />

                <hr>

                <div class="flex flex-col">
                    <div>
                        <div class="flex flex-row items-center gap-1 text-fg-muted text-xs mb-1">
                            <VCIcon name="fa6-solid:list-check" />
                            <span>Requirements</span>
                        </div>
                        <FAnalysisBuildNodesStep :entity="entity">
                            <template #default="{passed, message}">
                                <div class="flex flex-row gap-1">
                                    <div>
                                        <strong
                                            :title="message"
                                        >
                                            Node(s) Approval
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
                        </FAnalysisBuildNodesStep>
                    </div>

                    <template v-if="entity.build_os || entity.build_hash || size">
                        <hr>

                        <div>
                            <div class="flex flex-row items-center gap-1 text-fg-muted text-xs mb-1">
                                <VCIcon name="fa6-solid:circle-info" />
                                <span>Info</span>
                            </div>
                            <div class="flex flex-col">
                                <div
                                    v-if="entity.build_os"
                                    class="flex flex-row gap-1"
                                >
                                    <div>
                                        <strong>OS</strong>
                                    </div>
                                    <div>
                                        {{ entity.build_os }}
                                        <VCIcon :name="'fa6-brands:' + entity.build_os" />
                                    </div>
                                </div>
                                <div
                                    v-if="entity.build_hash"
                                    class="flex flex-row gap-1"
                                >
                                    <div>
                                        <strong>Hash</strong>
                                    </div>
                                    <div style="word-break: break-all;">
                                        {{ entity.build_hash }}
                                    </div>
                                </div>
                                <div
                                    v-if="size"
                                    class="flex flex-row gap-1"
                                >
                                    <div>
                                        <strong>Size</strong>
                                    </div>
                                    <div>
                                        {{ size }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="mt-auto">
                    <div class="flex flex-row gap-1 ">
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
