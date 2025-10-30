<!--
  - Copyright (c) 2021-2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">

import { AnalysisRunStatus } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        status: {
            type: String as PropType<`${AnalysisRunStatus}`>,
            default: null,
        },
    },
    setup(props) {
        const statusText = computed(() => {
            switch (props.status) {
                case AnalysisRunStatus.STARTING:
                    return 'starting...';
                case AnalysisRunStatus.STOPPING:
                    return 'stopping...';

                case AnalysisRunStatus.STARTED:
                    return 'started';
                case AnalysisRunStatus.STOPPED:
                    return 'stopped';

                case AnalysisRunStatus.FINISHED:
                    return 'finished';
                case AnalysisRunStatus.FAILED:
                    return 'failed';
                default:
                    return 'none';
            }
        });

        const classSuffix = computed(() => {
            switch (props.status) {
                case AnalysisRunStatus.STARTING:
                case AnalysisRunStatus.STARTED:
                case AnalysisRunStatus.STOPPED:
                    return 'primary';
                case AnalysisRunStatus.FINISHED:
                    return 'success';
                case AnalysisRunStatus.STOPPING:
                    return 'warning';
                case AnalysisRunStatus.FAILED:
                    return 'danger';
                default:
                    return 'info';
            }
        });

        const iconClass = computed(() => {
            switch (props.status) {
                case AnalysisRunStatus.STARTING:
                case AnalysisRunStatus.STARTED:
                case AnalysisRunStatus.STOPPING:
                    return 'fa fa-rotate fa-spin';
                case AnalysisRunStatus.FINISHED:
                    return 'fa fa-check';
                case AnalysisRunStatus.FAILED:
                case AnalysisRunStatus.STOPPED:
                    return 'fa fa-times';
                default:
                    return 'fa fa-circle';
            }
        });

        return {
            classSuffix,
            statusText,
            iconClass,
        };
    },
});
</script>
<template>
    <span>
        <slot
            v-bind="{classSuffix, statusText, iconClass}"
        >
            <span :class="'text-'+classSuffix">{{ statusText }}</span>
        </slot>
    </span>
</template>
