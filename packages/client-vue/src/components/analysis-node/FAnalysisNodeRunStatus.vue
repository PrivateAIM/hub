<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { AnalysisNodeRunStatus } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        status: {
            type: String as PropType<`${AnalysisNodeRunStatus}` | null>,
            default: null,
        },
        tag: {
            type: String,
            default: 'span',
        },
    },
    setup(props) {
        const statusText = computed(() => {
            if (props.status) {
                return props.status;
            }
            return 'none';
        });

        const classSuffix = computed(() => {
            switch (props.status) {
                case AnalysisNodeRunStatus.STARTING:
                case AnalysisNodeRunStatus.STARTED:
                    return 'primary';
                case AnalysisNodeRunStatus.FINISHED:
                    return 'success';
                case AnalysisNodeRunStatus.RUNNING:
                    return 'dark';
                case AnalysisNodeRunStatus.STOPPED:
                case AnalysisNodeRunStatus.STOPPING:
                    return 'warning';
                case AnalysisNodeRunStatus.FAILED:
                    return 'danger';
                default:
                    return 'secondary';
            }
        });

        return {
            statusText,
            classSuffix,
        };
    },
});
</script>
<template>
    <component :is="tag">
        <slot
            :class-suffix="classSuffix"
            :status-text="statusText"
        >
            <span :class="'text-'+classSuffix">{{ statusText }}</span>
        </slot>
    </component>
</template>
