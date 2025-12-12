<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { AnalysisBucketFile } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    ref,
    watch,
} from 'vue';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<AnalysisBucketFile>,
            required: true,
        },
        readonly: {
            type: Boolean,
        },
    },
    emits: ['updated'],
    setup(props, { emit }) {
        const isBlocked = ref(false);

        const isRoot = computed(() => props.entity.root);

        watch(isRoot, (newVal, oldVal) => {
            if (newVal !== oldVal) {
                isBlocked.value = false;
            }
        });

        const toggle = () => {
            if (isBlocked.value) return;

            isBlocked.value = true;

            emit('updated', {
                ...props.entity,
                root: isRoot.value ? null : props.entity.id,
            });
        };
        return {
            isRoot,
            toggle,
        };
    },
});
</script>
<template>
    <button
        type="button"
        class="btn btn-xs"
        :disabled="readonly"
        :class="{
            'btn-success': !isRoot,
            'btn-warning': isRoot
        }"
        @click.prevent="toggle"
    >
        <i
            :class="{
                'fa fa-check': !isRoot,
                'fa fa-times': isRoot
            }"
        />
    </button>
</template>
