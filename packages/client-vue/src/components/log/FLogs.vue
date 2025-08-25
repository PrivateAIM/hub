<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type {
    Log,
} from '@privateaim/telemetry-kit';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import {
    defineComponent,
    ref,
} from 'vue';
import type { ListMeta } from '../../core';
import { injectTelemetryHTTPClient } from '../../core';
import FLog from './FLog';

export default defineComponent({
    components: { FLog },
    props: {
        query: {
            type: Object as PropType<BuildInput<Log>>,
        },
    },
    setup(props) {
        const httpClient = injectTelemetryHTTPClient();

        const meta = ref<ListMeta<Log>>({
            pagination: {
                limit: 50,
                offset: 0,
            },
        });
        const busy = ref(false);
        const data = ref<Log[]>([]);

        const resolve = async (query?: BuildInput<Log>) => {
            busy.value = true;

            const response = await httpClient.log.getMany(query);

            data.value = response.data;
            meta.value = {
                ...meta.value,
                pagination: {
                    ...meta.value.pagination,
                    ...response.meta,
                },
            };

            busy.value = false;
        };

        const load = (input: ListMeta<Log>) => resolve({
            ...props.query,
            pagination: {
                ...(props.query?.pagination || {}),
                ...(input.pagination || {}),
            },
            filters: {
                ...(props.query?.filters || {}),
                ...(input.filters || {}),
            },
        });

        Promise.resolve()
            .then(() => resolve(props.query));

        return {
            busy,
            data,
            meta,
            load,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column gap-1">
        <slot name="default">
            <slot
                name="header"
                v-bind="{ busy, data, meta, load }"
            />
            <slot
                name="body"
                v-bind="{ busy, data, meta, load }"
            >
                <div class="log-container">
                    <div class="log-body">
                        <template
                            v-for="(item, index) in data"
                            :key="index"
                        >
                            <FLog
                                :entity="item"
                                :index="index"
                            />
                        </template>
                    </div>
                </div>
                <div class="d-flex flex-column gap-1" />
            </slot>
            <slot
                name="footer"
                v-bind="{ busy, data, meta, load }"
            />
        </slot>
    </div>
</template>
