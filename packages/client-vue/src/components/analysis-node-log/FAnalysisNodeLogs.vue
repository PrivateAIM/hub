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
    defineComponent,
    ref,
} from 'vue';
import { injectCoreHTTPClient } from '../../core';
import { FLog } from '../log';

export default defineComponent({
    components: { FLog },
    props: {
        analysisId: {
            type: String,
        },
        nodeId: {
            type: String,
        },
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

        const load = async (time?: string | bigint) => {
            const response = await httpClient.analysisNodeLog.getMany({
                filter: {
                    analysis_id: props.analysisId,
                    node_id: props.nodeId,
                    ...(time ? { time: `>${time}` } : {}),
                },
            });

            data.value.push(...response.data);

            if (response.meta.total > data.value.length) {
                return load(data.value[data.value.length - 1].time);
            }

            total.value = response.meta.total;

            return Promise.resolve();
        };

        Promise.resolve()
            .then(() => { busy.value = true; })
            .then(() => load())
            .then(() => { busy.value = false; });

        const reload = async () => {
            busy.value = true;

            data.value = [];
            total.value = 0;

            await load();

            busy.value = false;
        };

        return {
            data,
            busy,
            meta: {
                total: total.value,
            },
            load,
            reload,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column gap-1">
        <slot name="default">
            <slot
                name="header"
                v-bind="{ busy, data, meta, load, reload }"
            />
            <slot
                name="body"
                v-bind="{ busy, data, meta, load, reload }"
            >
                <div class="log-container">
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

            <slot
                name="header"
                v-bind="{ busy, data, meta, load, reload }"
            />
        </slot>
    </div>
</template>
