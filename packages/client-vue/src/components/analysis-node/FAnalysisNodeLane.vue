<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { AnalysisNode } from '@privateaim/core-kit';
import { NodeType } from '@privateaim/core-kit';
import { VCIcon } from '@vuecs/icon';
import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import {
    resolveAnalysisNodeApprovalState,
    resolveAnalysisNodeExecutionState,
} from '../../core';

export default defineComponent({
    components: { VCIcon },
    props: {
        entity: {
            type: Object as PropType<AnalysisNode>,
            required: true,
        },
    },
    setup(props) {
        const approvalState = computed(() => resolveAnalysisNodeApprovalState(props.entity));
        const executionState = computed(() => resolveAnalysisNodeExecutionState(props.entity));

        const nodeName = computed(() => props.entity.node?.name ?? props.entity.nodeId);
        const isAggregator = computed(() => props.entity.node?.type === NodeType.AGGREGATOR);

        const progress = computed(() => {
            if (executionState.value === 'done') {
                return 100;
            }

            return Math.min(100, Math.max(0, props.entity.executionProgress ?? 0));
        });

        const commentVisible = ref(false);
        const toggleComment = () => {
            commentVisible.value = !commentVisible.value;
        };

        return {
            approvalState,
            executionState,
            nodeName,
            isAggregator,
            progress,
            commentVisible,
            toggleComment,
        };
    },
});
</script>
<template>
    <div class="flex flex-col gap-1">
        <div class="grid items-center gap-x-3 text-[0.78rem] grid-cols-[minmax(9rem,1.3fr)_6rem_minmax(5rem,1fr)_4.5rem_2.75rem]">
            <span class="flex min-w-0 items-center gap-1.5">
                <VCIcon
                    name="fa6-solid:server"
                    class="text-[0.7rem] text-fg-muted"
                />
                <span class="truncate font-bold">{{ nodeName }}</span>
                <span
                    v-if="isAggregator"
                    class="rounded border border-current px-1 text-[0.58rem] font-bold tracking-wider text-fg-muted"
                >AGG</span>
            </span>

            <span
                class="inline-flex items-center gap-1.5 text-xs font-bold"
                :class="{
                    'text-success-600': approvalState === 'approved',
                    'text-warning-600': approvalState === 'pending',
                    'text-error-600': approvalState === 'rejected',
                }"
            >
                <VCIcon
                    :name="approvalState === 'approved' ?
                        'fa6-solid:thumbs-up' :
                        (approvalState === 'rejected' ? 'fa6-solid:thumbs-down' : 'fa6-solid:clock')"
                    class="text-[0.68rem]"
                />
                {{ approvalState }}
                <button
                    v-if="entity.comment"
                    type="button"
                    class="grid h-5 w-5 cursor-pointer place-items-center rounded border border-border bg-bg
                       text-fg-muted hover:text-fg"
                    :aria-expanded="commentVisible"
                    title="Show comment"
                    @click.prevent="toggleComment"
                >
                    <VCIcon
                        name="fa6-solid:comment"
                        class="text-[0.62rem]"
                    />
                </button>
            </span>

            <span
                class="inline-flex items-center gap-1.5 text-xs font-bold"
                :class="{
                    'text-primary-600': executionState === 'running',
                    'text-success-600': executionState === 'done',
                    'text-error-600': executionState === 'failed',
                    'text-fg-muted': executionState === 'waiting',
                }"
            >
                <VCIcon
                    v-if="executionState === 'running'"
                    name="fa6-solid:rotate"
                    class="animate-spin text-[0.68rem]"
                />
                <VCIcon
                    v-else-if="executionState === 'done'"
                    name="fa6-solid:check"
                    class="text-[0.68rem]"
                />
                <VCIcon
                    v-else-if="executionState === 'failed'"
                    name="fa6-solid:xmark"
                    class="text-[0.68rem]"
                />
                {{ executionState === 'waiting' ? '—' : executionState }}
            </span>

            <span class="h-1 overflow-hidden rounded-full border border-border bg-bg">
                <span
                    class="block h-full"
                    :class="executionState === 'failed' ?
                        'bg-error-600' :
                        (executionState === 'done' ? 'bg-success-600' : 'bg-primary-600')"
                    :style="{ width: progress + '%' }"
                />
            </span>
            <span class="text-end text-xs tabular-nums text-fg-muted">
                {{ progress > 0 || executionState !== 'waiting' ? progress + '%' : '' }}
            </span>
        </div>
        <!-- Inline reveal, NOT an absolutely-positioned popover: the lane
             list scrolls horizontally on narrow viewports, and a floated
             panel inside a scroll container gets clipped by it. -->
        <div
            v-if="commentVisible && entity.comment"
            class="rounded-md border border-dashed border-border bg-bg px-2.5 py-1.5 text-xs text-fg-muted"
        >
            “{{ entity.comment }}”
        </div>
    </div>
</template>
