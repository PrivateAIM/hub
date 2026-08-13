<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { VCIcon } from '@vuecs/icon';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { formatByteSize } from '../../utils';
import type { AnalysisStage, AnalysisStageState } from './types';

const STATE_CIRCLE_CLASS : Record<AnalysisStageState, string> = {
    done: 'bg-success-600 border-success-600 text-white',
    run: 'border-primary-600 text-primary-600 bg-bg',
    fail: 'bg-error-600 border-error-600 text-white',
    wait: 'border-warning-600 text-warning-600 bg-bg',
    idle: 'border-border text-fg-muted bg-bg',
};

const STATE_LABEL_CLASS : Record<AnalysisStageState, string> = {
    done: 'text-fg',
    run: 'text-primary-600',
    fail: 'text-error-600',
    wait: 'text-warning-600',
    idle: 'text-fg-muted',
};

const STATE_ICON : Record<AnalysisStageState, string | null> = {
    done: 'fa6-solid:check',
    run: 'fa6-solid:rotate',
    fail: 'fa6-solid:xmark',
    wait: 'fa6-solid:clock',
    idle: null,
};

function resolveProcessStage(
    status: `${ProcessStatus}` | null,
    progress: number | null,
) : { state: AnalysisStageState, sub: string } {
    switch (status) {
        case ProcessStatus.EXECUTED:
            return { state: 'done', sub: 'done' };
        case ProcessStatus.FAILED:
            return { state: 'fail', sub: 'failed' };
        case ProcessStatus.STARTING:
        case ProcessStatus.STARTED:
        case ProcessStatus.EXECUTING:
        case ProcessStatus.STOPPING:
            return { state: 'run', sub: `${progress ?? 0}%` };
        case ProcessStatus.STOPPED:
            return { state: 'idle', sub: 'stopped' };
        default:
            return { state: 'idle', sub: '—' };
    }
}

export default defineComponent({
    components: { VCIcon },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        /**
         * Dots only — no stage labels, no sub-captions, tighter circles and
         * connectors. For places that show the rail as one line inside a
         * denser element (a project card row), where the full rail's ~250px
         * of labelled columns would dominate whatever it sits in.
         *
         * The stage computation is shared, so a compact rail can never
         * disagree with the full one about what state an analysis is in.
         * Dropping the visible labels would otherwise drop the meaning, so
         * each dot carries it twice: a `title` for pointer hover, and
         * `role="img"` + `aria-label` for assistive technology, which does
         * not reliably announce `title` on a non-interactive element.
         */
        compact: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const stages = computed<AnalysisStage[]>(() => {
            const { entity } = props;

            let configuration : AnalysisStage;
            if (entity.configurationLocked) {
                configuration = {
                    key: 'configuration', 
                    label: 'Configuration', 
                    state: 'done', 
                    sub: 'locked', 
                    icon: null,
                };
            } else {
                let sub = 'unlocked';
                if (!entity.configurationImageValid) {
                    sub = 'image missing';
                } else if (!entity.configurationEntrypointValid) {
                    sub = 'entrypoint missing';
                } else if (!entity.configurationNodesValid) {
                    sub = 'nodes missing';
                }

                configuration = {
                    key: 'configuration', 
                    label: 'Configuration', 
                    state: 'wait', 
                    sub, 
                    icon: 'fa6-solid:lock-open',
                };
            }

            let approval : AnalysisStage;
            if (!entity.nodes) {
                approval = {
                    key: 'approval', 
                    label: 'Approval', 
                    state: 'idle', 
                    sub: 'no nodes', 
                    icon: null,
                };
            } else if (entity.nodesApproved >= entity.nodes) {
                approval = {
                    key: 'approval', 
                    label: 'Approval', 
                    state: 'done', 
                    sub: `${entity.nodesApproved} of ${entity.nodes}`, 
                    icon: 'fa6-solid:thumbs-up',
                };
            } else {
                approval = {
                    key: 'approval', 
                    label: 'Approval', 
                    state: 'wait', 
                    sub: `${entity.nodesApproved} of ${entity.nodes}`, 
                    icon: null,
                };
            }

            const build = resolveProcessStage(entity.buildStatus, entity.buildProgress);
            let buildSub = build.sub;
            if (build.state === 'done') {
                const parts : string[] = [];
                if (entity.buildOs) {
                    parts.push(entity.buildOs);
                }
                if (entity.buildSize) {
                    parts.push(formatByteSize(entity.buildSize));
                }
                if (parts.length > 0) {
                    buildSub = parts.join(' · ');
                }
            }

            const distribution = resolveProcessStage(entity.distributionStatus, entity.distributionProgress);
            const execution = resolveProcessStage(entity.executionStatus, entity.executionProgress);

            return [
                configuration,
                approval,
                {
                    key: 'build', 
                    label: 'Build', 
                    state: build.state, 
                    sub: buildSub, 
                    icon: null,
                },
                {
                    key: 'distribution', 
                    label: 'Distribution', 
                    state: distribution.state, 
                    sub: distribution.sub, 
                    icon: null,
                },
                {
                    key: 'execution',
                    label: 'Execution',
                    state: execution.state,
                    sub: execution.state === 'done' ? 'completed' : execution.sub,
                    icon: null,
                },
            ];
        });

        const resolveIcon = (stage: AnalysisStage) => stage.icon ?? STATE_ICON[stage.state];

        return {
            stages,
            resolveIcon,
            STATE_CIRCLE_CLASS,
            STATE_LABEL_CLASS,
        };
    },
});
</script>
<template>
    <div
        class="flex overflow-x-auto"
        :class="compact ? 'items-center' : 'items-start px-1 pb-1 pt-3'"
    >
        <template
            v-for="(stage, index) in stages"
            :key="stage.key"
        >
            <span
                v-if="index > 0"
                class="h-0.5 flex-1"
                :class="[
                    stages[index - 1]?.state === 'done' ? 'bg-success-600' : 'bg-border',
                    compact ? 'min-w-1.5' : 'mt-3 min-w-2',
                ]"
            />
            <div
                v-if="compact"
                role="img"
                class="grid h-3.5 w-3.5 flex-none place-items-center rounded-full border-2 text-[0.4rem]"
                :class="STATE_CIRCLE_CLASS[stage.state]"
                :aria-label="`${stage.label}: ${stage.sub}`"
                :title="`${stage.label}: ${stage.sub}`"
            >
                <VCIcon
                    v-if="resolveIcon(stage)"
                    :name="resolveIcon(stage)!"
                    :class="stage.state === 'run' ? 'animate-spin' : ''"
                />
            </div>
            <div
                v-else
                class="flex w-24 flex-none flex-col items-center gap-1 text-center"
            >
                <span
                    class="grid h-6 w-6 place-items-center rounded-full border-2 text-[0.6rem]"
                    :class="STATE_CIRCLE_CLASS[stage.state]"
                >
                    <VCIcon
                        v-if="resolveIcon(stage)"
                        :name="resolveIcon(stage)!"
                        :class="stage.state === 'run' ? 'animate-spin' : ''"
                    />
                </span>
                <span
                    class="text-xs font-bold leading-tight"
                    :class="STATE_LABEL_CLASS[stage.state]"
                >
                    {{ stage.label }}
                </span>
                <span class="text-[0.68rem] leading-tight text-fg-muted">
                    {{ stage.sub }}
                </span>
            </div>
        </template>
    </div>
</template>
