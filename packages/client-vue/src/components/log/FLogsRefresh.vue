<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCCountdown } from '@vuecs/countdown';
import {
    computed,
    defineComponent,
    ref,
} from 'vue';

export default defineComponent({
    components: { VCCountdown },
    props: {
        busy: {
            type: Boolean,
            default: false,
        },
        interval: {
            type: Number,
            default: 5,
        },
        enabled: {
            type: Boolean,
            default: true,
        },
    },
    emits: ['refresh'],
    setup(props, { emit }) {
        const active = ref(props.enabled);

        // Clamp to at least 1s so a 0/negative interval can't produce a 0ms
        // countdown that ends immediately and storms the API.
        const intervalMs = computed(() => Math.max(1, props.interval) * 1000);

        const toggle = () => {
            active.value = !active.value;
        };

        // The countdown is only mounted while `active` and not `busy`. When the
        // parent reloads it sets `busy`, which unmounts the countdown; once the
        // reload finishes the countdown re-mounts and counts down again — so the
        // auto-refresh loops without overlapping requests.
        const handleEnd = () => {
            emit('refresh');
        };

        const refresh = () => {
            emit('refresh');
        };

        return {
            active,
            intervalMs,
            toggle,
            handleEnd,
            refresh,
        };
    },
});
</script>
<template>
    <div class="flex flex-row items-center gap-2">
        <small class="log-refresh-status text-fg-muted">
            <template v-if="busy">
                <i class="fa fa-spinner fa-spin pe-1" />refreshing
            </template>
            <template v-else-if="active">
                <VCCountdown
                    :time="intervalMs"
                    @end="handleEnd"
                >
                    <template #default="countdown">
                        <i class="fa fa-clock pe-1" />refresh in {{ countdown.totalSeconds }}s
                    </template>
                </VCCountdown>
            </template>
            <template v-else>
                <i class="fa fa-pause pe-1" />paused
            </template>
        </small>
        <button
            type="button"
            class="btn btn-xs"
            :class="active ? 'btn-secondary' : 'btn-primary'"
            :title="active ? 'Pause auto-refresh' : 'Resume auto-refresh'"
            @click.prevent="toggle"
        >
            <i
                class="fa"
                :class="active ? 'fa-pause' : 'fa-play'"
            />
        </button>
        <button
            type="button"
            class="btn btn-xs btn-primary"
            :disabled="busy"
            title="Refresh now"
            @click.prevent="refresh"
        >
            <i class="fa fa-refresh" />
        </button>
    </div>
</template>
