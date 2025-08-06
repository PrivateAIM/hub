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
            limit: 50,
            offset: 0,
        });
        const busy = ref(false);
        const data = ref<Event[]>([]);

        const resolve = async () => {
            busy.value = true;

            const response = await httpClient.event.getMany(props.query);

            data.value = response.data;
            meta.value = {
                ...meta.value,
                ...response.meta,
            };

            busy.value = false;
        };

        const load = async () => {
            // todo: load more items :) ^^
        };

        Promise.resolve()
            .then(() => resolve());

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
</template>
