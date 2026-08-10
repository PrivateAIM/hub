<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { AnalysisNode } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import {
    buildAnalysisNodeApprovalDistribution,
    buildAnalysisNodeExecutionDistribution,
} from '../../core';

const SEGMENT_CLASS : Record<string, string> = {
    approved: 'bg-success-600',
    pending: 'bg-warning-600',
    rejected: 'bg-error-600',
    done: 'bg-success-600',
    running: 'bg-primary-600',
    waiting: 'bg-fg-muted/40',
    failed: 'bg-error-600',
};

const COUNT_CLASS : Record<string, string> = {
    approved: 'text-success-600',
    pending: 'text-warning-600',
    rejected: 'text-error-600',
    done: 'text-success-600',
    running: 'text-primary-600',
    waiting: 'text-fg',
    failed: 'text-error-600',
};

export default defineComponent({
    props: {
        entities: {
            type: Array as PropType<AnalysisNode[]>,
            required: true,
        },
    },
    setup(props) {
        const rows = computed(() => [
            {
                key: 'approval',
                label: 'Approval',
                segments: buildAnalysisNodeApprovalDistribution(props.entities),
            },
            {
                key: 'execution',
                label: 'Execution',
                segments: buildAnalysisNodeExecutionDistribution(props.entities),
            },
        ]);

        return {
            rows,
            SEGMENT_CLASS,
            COUNT_CLASS,
        };
    },
});
</script>
<template>
    <div class="flex flex-col gap-2">
        <div
            v-for="row in rows"
            :key="row.key"
            class="flex items-center gap-3 text-xs"
        >
            <span class="w-[4.5rem] flex-none font-bold text-fg-muted">{{ row.label }}</span>
            <span class="flex h-2 min-w-24 flex-1 overflow-hidden rounded-full border border-border bg-bg">
                <span
                    v-for="segment in row.segments"
                    :key="segment.key"
                    class="h-full"
                    :class="SEGMENT_CLASS[segment.key]"
                    :style="{ flexGrow: segment.count }"
                />
            </span>
            <span class="flex-none whitespace-nowrap tabular-nums text-fg-muted">
                <template
                    v-for="(segment, index) in row.segments"
                    :key="segment.key"
                >
                    <template v-if="index > 0">
                        ·
                    </template>
                    <b :class="COUNT_CLASS[segment.key]">{{ segment.count }}</b> {{ segment.key }}
                </template>
            </span>
        </div>
    </div>
</template>
