<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        progress: {
            type: Number,
            required: true,
        },
        colorClass: {
            type: String,
            default: 'bg-success-600',
        },
        showText: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
<template>
    <div class="progress">
        <div
            class="progress-bar"
            :class="colorClass"
            :style="{width: progress + '%'}"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
        >
            <template v-if="showText">
                {{ progress }}%
            </template>
        </div>
    </div>
</template>
