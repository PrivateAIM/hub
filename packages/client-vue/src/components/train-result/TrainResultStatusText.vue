<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { AnalysisResultStatus } from '@privateaim/core';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        status: {
            type: Object as PropType<AnalysisResultStatus>,
        },
    },
    setup(props) {
        const statusText = computed(() => {
            switch (props.status) {
                case AnalysisResultStatus.STARTED:
                    return 'started';

                case AnalysisResultStatus.DOWNLOADING:
                    return 'downloading...';
                case AnalysisResultStatus.DOWNLOADED:
                    return 'downloaded';

                case AnalysisResultStatus.PROCESSING:
                    return 'extracting...';
                case AnalysisResultStatus.PROCESSED:
                    return 'extracted';

                case AnalysisResultStatus.FINISHED:
                    return 'finished';
                case AnalysisResultStatus.FAILED:
                    return 'failed';

                default:
                    return 'none';
            }
        });

        const classSuffix = computed(() => {
            switch (props.status) {
                case AnalysisResultStatus.STARTED:
                case AnalysisResultStatus.DOWNLOADING:
                case AnalysisResultStatus.PROCESSING:
                case AnalysisResultStatus.PROCESSED:
                    return 'primary';

                case AnalysisResultStatus.FINISHED:
                    return 'success';

                case AnalysisResultStatus.FAILED:
                    return 'danger';

                default:
                    return 'info';
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
    <span>
        <slot
            :class-suffix="classSuffix"
            :status-text="statusText"
        >
            <span :class="'text-'+classSuffix">{{ statusText }}</span>
        </slot>
    </span>
</template>
