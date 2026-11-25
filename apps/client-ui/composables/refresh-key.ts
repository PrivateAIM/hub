/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Ref } from 'vue';
import { onBeforeUnmount, ref } from 'vue';

/**
 * A `:key` for components that load once in setup (`FLogs`, `FEvents`):
 * bumping it remounts them, which re-runs their query.
 *
 * `refresh()` bumps it now; `refreshLater(delays)` bumps it once per delay
 * (ms). Telemetry arrives after the state it describes (server-core saves an
 * entity, then dispatches the event; logs travel through the worker), so a
 * single reload at the moment a status changes can miss the record.
 * A later call cancels the pending bumps of an earlier one.
 */
export function useRefreshKey() : {
    key: Ref<number>,
    refresh: () => void,
    refreshLater: (delays: number[]) => void,
} {
    const key = ref(0);
    let timers: ReturnType<typeof setTimeout>[] = [];

    const clear = () => {
        for (const timer of timers) {
            clearTimeout(timer);
        }

        timers = [];
    };

    const refresh = () => {
        key.value++;
    };

    const refreshLater = (delays: number[]) => {
        clear();

        timers = delays.map((delay) => setTimeout(refresh, delay));
    };

    onBeforeUnmount(clear);

    return {
        key, 
        refresh, 
        refreshLater, 
    };
}
