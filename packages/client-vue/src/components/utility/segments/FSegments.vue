<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { SegmentItem } from './types';

export default defineComponent({
    props: {
        items: {
            type: Array as PropType<SegmentItem[]>,
            required: true,
        },
        modelValue: {
            type: String,
            required: true,
        },
    },
    emits: ['update:modelValue'],
});
</script>
<template>
    <div class="inline-flex w-max gap-0.5 rounded-lg border border-border bg-bg-elevated p-0.5">
        <button
            v-for="item in items"
            :key="item.key"
            type="button"
            class="cursor-pointer whitespace-nowrap rounded-md border-0 bg-transparent px-3 py-1 text-[0.76rem] font-bold"
            :class="item.key === modelValue ? 'bg-bg text-fg shadow-sm' : 'text-fg-muted hover:text-fg'"
            @click.prevent="$emit('update:modelValue', item.key)"
        >
            {{ item.label }}
            <span
                v-if="item.count !== undefined"
                class="ms-1 font-normal"
                :class="item.emphasis ? 'text-primary-600' : 'text-fg-muted'"
            >{{ item.count }}</span>
        </button>
    </div>
</template>
