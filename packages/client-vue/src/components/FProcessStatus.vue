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
import { resolveTextColorClass } from '../core';

export default defineComponent({
    props: {
        value: { type: String as PropType<`${ProcessStatus}` | null> },
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

        const iconName = computed(() => {
            switch (props.value) {
                case ProcessStatus.STARTING:
                case ProcessStatus.STARTED:
                case ProcessStatus.STOPPING:
                    return 'fa6-solid:rotate';
                case ProcessStatus.EXECUTED:
                    return 'fa6-solid:check';
                case ProcessStatus.FAILED:
                case ProcessStatus.STOPPED:
                    return 'fa6-solid:xmark';
                default:
                    return 'fa6-solid:question';
            }
        });

        const iconClass = computed(() => {
            switch (props.value) {
                case ProcessStatus.STARTING:
                case ProcessStatus.STARTED:
                case ProcessStatus.STOPPING:
                    return 'animate-spin';
                case ProcessStatus.EXECUTED:
                    return '';
                case ProcessStatus.FAILED:
                case ProcessStatus.STOPPED:
                    return 'text-sm';
                default:
                    return 'text-sm';
            }
        });

        return {
            classSuffix,
            iconName,
            iconClass,
            resolveTextColorClass,
        };
    },
});
</script>
<template>
    <slot
        name="default"
        v-bind="{ iconName, iconClass, value: value || defaultValue, classSuffix }"
    >
        <component
            :is="tag"
            :class="resolveTextColorClass(classSuffix)"
        >
            {{ value || defaultValue }}
        </component>
    </slot>
</template>
