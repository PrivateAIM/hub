<!--
  - Copyright (c) 2021-2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { AnalysisBuildStatus } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        status: {
            type: String as PropType<`${AnalysisBuildStatus}`>,
            default: null,
        },
    },
    setup(props) {
        const statusText = computed(() => {
            switch (props.status) {
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
        });

        const classSuffix = computed(() => {
            switch (props.status) {
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
        });

        const iconClass = computed(() => {
            switch (props.status) {
                case AnalysisBuildStatus.STARTING:
                case AnalysisBuildStatus.STARTED:
                case AnalysisBuildStatus.STOPPING:
                    return 'fa fa-rotate fa-spin';
                case AnalysisBuildStatus.FINISHED:
                    return 'fa fa-check';
                case AnalysisBuildStatus.FAILED:
                case AnalysisBuildStatus.STOPPED:
                    return 'fa fa-times';
                default:
                    return 'fa fa-circle';
            }
        });

        return {
            statusText,
            classSuffix,
            iconClass,
        };
    },
});
</script>
<template>
    <span>
        <slot
            v-bind="{ iconClass, statusText, classSuffix }"
        >
            <span :class="'text-'+classSuffix">{{ statusText }}</span>
        </slot>
    </span>
</template>
