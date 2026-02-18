<!--
  - Copyright (c) 2021-2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ProcessStatus } from '@privateaim/kit';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        value: {
            type: String as PropType<`${ProcessStatus}` | null>,
        },
        defaultValue: {
            type: String,
            default: 'none',
        },
        tag: {
            type: String,
            default: 'span',
        },
    },
    setup(props) {
        const classSuffix = computed(() => {
            switch (props.value) {
                case ProcessStatus.STARTING:
                case ProcessStatus.STARTED:
                case ProcessStatus.STOPPED:
                    return 'primary';
                case ProcessStatus.EXECUTED:
                    return 'success';
                case ProcessStatus.STOPPING:
                    return 'warning';
                case ProcessStatus.FAILED:
                    return 'danger';
                default:
                    return 'primary';
            }
        });

        const iconClass = computed(() => {
            switch (props.value) {
                case ProcessStatus.STARTING:
                case ProcessStatus.STARTED:
                case ProcessStatus.STOPPING:
                    return 'fa fa-rotate fa-spin';
                case ProcessStatus.EXECUTED:
                    return 'fa fa-check';
                case ProcessStatus.FAILED:
                case ProcessStatus.STOPPED:
                    return 'fa fa-sm fa-times';
                default:
                    return 'fa fa-sm fa-question';
            }
        });

        return {
            classSuffix,
            iconClass,
        };
    },
});
</script>
<template>
    <slot
        name="default"
        v-bind="{ iconClass, value: value || defaultValue, classSuffix }"
    >
        <component
            :is="tag"
            :class="'text-'+classSuffix"
        >
            {{ value || defaultValue }}
        </component>
    </slot>
</template>
