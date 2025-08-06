<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type {
    Event,
} from '@privateaim/telemetry-kit';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import {
    defineComponent,
    ref,
} from 'vue';
import type { ListMeta } from '../../core';
import { injectTelemetryHTTPClient } from '../../core';

export default defineComponent({
    props: {
        query: {
            type: Object as PropType<BuildInput<Event>>,
        },
    },
    setup(props) {
        const httpClient = injectTelemetryHTTPClient();

        const meta = ref<ListMeta<Event>>({
            pagination: {
                limit: 50,
                offset: 0,
            },
        });
        const busy = ref(false);
        const data = ref<Event[]>([]);

        const resolve = async (query?: BuildInput<Event>) => {
            busy.value = true;

            const response = await httpClient.event.getMany(query);

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

        const load = (input: ListMeta<Event>) => resolve({
            ...props.query,
            pagination: {
                ...(props.query.pagination),
                ...(input.pagination || {}),
            },
            filters: {
                ...(props.query.filters || {}),
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
                v-bind="{busy, data, meta, load}"
            />
            <slot
                name="body"
                v-bind="{busy, data, meta, load}"
            />
            <slot
                name="footer"
                v-bind="{busy, data, meta, load}"
            />
        </slot>
    </div>
</template>
