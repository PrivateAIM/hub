<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Log } from '@privateaim/telemetry-kit';
import type { Ref } from 'vue';
import {
    computed,
    defineComponent,
    ref,
} from 'vue';
import { useScrollPreserver } from '../../composables';
import { injectCoreHTTPClient } from '../../core';
import { FLog, FLogsRefresh } from '../log';

export default defineComponent({
    components: { FLog, FLogsRefresh },
    props: {
        analysisId: { type: String },
        nodeId: { type: String },
        realmId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const httpClient = injectCoreHTTPClient();

        const busy = ref(false);
        const total = ref(0);
        const data : Ref<Log[]> = ref([]);

        const { preserve } = useScrollPreserver('logContainer');

        const collect = async (target: Log[], offset = 0) : Promise<void> => {
            const response = await httpClient.analysisNodeLog.getMany({
                filter: {
                    analysis_id: props.analysisId,
                    node_id: props.nodeId,
                },
                page: { offset },
            });

            target.push(...response.data);

            total.value = response.meta.total;

            // Page forward while records remain beyond the current window
            // (total > offset + limit), advancing the offset by one page. The
            // `limit > 0` guard prevents an unbounded loop if the window never
            // advances.
            const nextOffset = response.meta.offset + response.meta.limit;
            if (response.meta.limit > 0 && response.meta.total > nextOffset) {
                return collect(target, nextOffset);
            }

            return undefined;
        };

        const load = (offset = 0) => collect(data.value, offset);

        (async () => {
            busy.value = true;

            try {
                await load();
            } finally {
                busy.value = false;
            }
        })();

        // Collect into a fresh array and swap atomically, so the currently
        // displayed logs stay visible until the reload completes (no flicker
        // while auto-refreshing). `preserve` keeps the scroll position sensible:
        // following the newest entries at the bottom, staying put otherwise.
        const reload = async () => {
            busy.value = true;

            try {
                const next : Log[] = [];
                await collect(next);
                await preserve(() => {
                    data.value = next;
                });
            } finally {
                busy.value = false;
            }
        };

        return {
            data,
            busy,
            meta: computed(() => ({ total: total.value })),
            load,
            reload,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column gap-1">
        <slot name="default">
            <div class="d-flex flex-row align-items-center">
                <slot
                    name="header"
                    v-bind="{ busy, data, meta, load, reload }"
                />
                <div class="ms-auto">
                    <FLogsRefresh
                        :busy="busy"
                        @refresh="reload"
                    />
                </div>
            </div>
            <slot
                name="body"
                v-bind="{ busy, data, meta, load, reload }"
            >
                <div
                    ref="logContainer"
                    class="log-container"
                >
                    <div class="log-body">
                        <template
                            v-for="(item, key) in data"
                            :key="key"
                        >
                            <FLog
                                :entity="item"
                                :index="key"
                            />
                        </template>
                    </div>
                </div>
            </slot>
        </slot>
    </div>
</template>
