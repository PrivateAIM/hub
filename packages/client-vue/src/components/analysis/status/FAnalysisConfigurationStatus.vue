<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { computed, defineComponent, toRef } from 'vue';

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

        const iconClass = computed(() => {
            if (locked.value) {
                return 'fas fa-lock';
            }

            return 'fas fa-unlock';
        });

        const classSuffix = computed(() => {
            if (locked.value) {
                return 'success';
            }

            return 'info';
        });

        return {
            statusText,
            iconClass,
            classSuffix,
        };
    },
});
</script>
<template>
    <span>
        <slot
            v-bind="{ classSuffix, statusText }"
        >
            <span :class="'text-'+classSuffix"> {{ statusText }}</span>
        </slot>
    </span>
</template>
