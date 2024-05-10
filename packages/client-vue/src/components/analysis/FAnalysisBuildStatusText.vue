<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">

import { AnalysisBuildStatus } from '@privateaim/core';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        status: {
            type: String as PropType<`${AnalysisBuildStatus}`>,
            default: null,
        },
    },
    computed: {
        statusText() {
            switch (this.status) {
                case AnalysisBuildStatus.STARTING:
                    return 'starting...';
                case AnalysisBuildStatus.STOPPING:
                    return 'stopping...';

                case AnalysisBuildStatus.STARTED:
                    return 'started';
                case AnalysisBuildStatus.STOPPED:
                    return 'stopped';

                case AnalysisBuildStatus.FINISHED:
                    return 'finished';
                case AnalysisBuildStatus.FAILED:
                    return 'failed';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case AnalysisBuildStatus.STARTING:
                case AnalysisBuildStatus.STARTED:
                case AnalysisBuildStatus.STOPPED:
                    return 'primary';
                case AnalysisBuildStatus.FINISHED:
                    return 'success';
                case AnalysisBuildStatus.STOPPING:
                    return 'warning';
                case AnalysisBuildStatus.FAILED:
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
