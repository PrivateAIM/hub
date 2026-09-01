<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectTelemetryHTTPClient } from '@privateaim/client-vue';
import type {
    Event,
} from '@privateaim/telemetry-kit';
import { defineComponent } from 'vue';
import { VCIcon } from '@vuecs/icon';
import {
    useRoute,
} from '#imports';
import { useEntityRecord } from '../../../composables/entity-record';

export default defineComponent({
    components: { VCIcon },
    async setup() {
        const route = useRoute('admin-events-id');

        // Resolved up front: the handler can run after setup's first await,
        // where `inject()` no longer resolves.
        const httpClient = injectTelemetryHTTPClient();

        const entity = await useEntityRecord<Event>(
            `event:${route.params.id}`,
            () => httpClient.event
                .getOne(route.params.id as string)
                .then((response) => response.data),
            '/admin/events',
        );

        // The ref itself — the template unwraps it, so `entity.id` still
        // resolves, while the plain value this used to return pinned the page
        // to the record as it stood during setup.
        return { entity };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <VCIcon name="fa6-solid:bullhorn" />
            Event
            <span class="sub-title">{{ entity.id }}</span>
        </h1>

        <NuxtPage
            :entity="entity"
        />
    </div>
</template>
