<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { AnalysisRunStatus } from '@privateaim/core';
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        status: {
            type: String,
            default: null,
        },
    },
    computed: {
        statusText() {
            switch (this.status) {
                case AnalysisRunStatus.STARTING:
                    return 'starting...';
                case AnalysisRunStatus.RUNNING:
                    return 'running...';
                case AnalysisRunStatus.STOPPING:
                    return 'stopping...';
                case AnalysisRunStatus.STOPPED:
                    return 'stopped...';
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
                case AnalysisRunStatus.STOPPING:
                case AnalysisRunStatus.RUNNING:
                    return 'primary';
                case AnalysisRunStatus.STOPPED:
                    return 'warning';
                case AnalysisRunStatus.FINISHED:
                    return 'success';
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
