<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">

import { AnalysisRunStatus } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        status: {
            type: String as PropType<`${AnalysisRunStatus}`>,
            default: null,
        },
    },
    computed: {
        statusText() {
            switch (this.status) {
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
        },
        classSuffix() {
            switch (this.status) {
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
        },
    },
});
</script>
<template>
    <span>
        <slot
            :class-suffix="classSuffix"
            :status-text="statusText"
        >
            <span :class="'text-'+classSuffix">{{ statusText }}</span>
        </slot>
    </span>
</template>
