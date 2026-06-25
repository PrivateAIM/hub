<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { computed, defineComponent, toRef } from 'vue';
import { resolveTextColorClass } from '../../../core';

export default defineComponent({
    props: {
        locked: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const locked = toRef(props, 'locked');
        const statusText = computed(() => {
            if (locked.value) {
                return 'finished';
            }

            return 'none';
        });

        const iconName = computed(() => {
            if (locked.value) {
                return 'fa6-solid:lock';
            }

            return 'fa6-solid:unlock';
        });

        const classSuffix = computed(() => {
            if (locked.value) {
                return 'success';
            }

            return 'primary';
        });

        return {
            statusText,
            iconName,
            classSuffix,
            resolveTextColorClass,
        };
    },
});
</script>
<template>
    <span>
        <slot
            v-bind="{ classSuffix, statusText }"
        >
            <span :class="resolveTextColorClass(classSuffix)"> {{ statusText }}</span>
        </slot>
    </span>
</template>
