<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ProcessStatus } from '@privateaim/kit';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { resolveTextColorClass } from '../../core';

export default defineComponent({
    props: {
        status: {
            type: String as PropType<`${ProcessStatus}` | null>,
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
            return 'unknown';
        });

        const classSuffix = computed(() => {
            switch (props.status) {
                case ProcessStatus.STARTING:
                    return 'primary';
                case ProcessStatus.EXECUTED:
                    return 'success';
                case ProcessStatus.STARTED:
                    return 'dark';
                case ProcessStatus.STOPPED:
                case ProcessStatus.STOPPING:
                    return 'warning';
                case ProcessStatus.FAILED:
                    return 'danger';
                default:
                    return 'secondary';
            }
        });

        return {
            statusText,
            classSuffix,
            resolveTextColorClass,
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
            <span :class="resolveTextColorClass(classSuffix)">{{ statusText }}</span>
        </slot>
    </component>
</template>
