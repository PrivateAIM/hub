<!--
  - Copyright (c) 2021-2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">

import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { ProcessStatus } from '@privateaim/kit';

export default defineComponent({
    props: {
        status: {
            type: String as PropType<`${ProcessStatus}`>,
            default: null,
        },
    },
    setup(props) {
        const statusText = computed(() => {
            switch (props.status) {
                case ProcessStatus.STARTING:
                    return 'starting...';
                case ProcessStatus.STOPPING:
                    return 'stopping...';

                case ProcessStatus.STARTED:
                    return 'started';
                case ProcessStatus.STOPPED:
                    return 'stopped';

                case ProcessStatus.FINISHED:
                    return 'finished';
                case ProcessStatus.FAILED:
                    return 'failed';
                default:
                    return 'none';
            }
        });

        const classSuffix = computed(() => {
            switch (props.status) {
                case ProcessStatus.STARTING:
                case ProcessStatus.STARTED:
                case ProcessStatus.STOPPED:
                    return 'primary';
                case ProcessStatus.FINISHED:
                    return 'success';
                case ProcessStatus.STOPPING:
                    return 'warning';
                case ProcessStatus.FAILED:
                    return 'danger';
                default:
                    return 'info';
            }
        });

        const iconClass = computed(() => {
            switch (props.status) {
                case ProcessStatus.STARTING:
                case ProcessStatus.STARTED:
                case ProcessStatus.STOPPING:
                    return 'fa fa-rotate fa-spin';
                case ProcessStatus.FINISHED:
                    return 'fa fa-check';
                case ProcessStatus.FAILED:
                case ProcessStatus.STOPPED:
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
