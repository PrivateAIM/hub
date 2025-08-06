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
import { defineComponent, ref } from 'vue';
import {
    useRoute,
} from '#imports';
import { createError, navigateTo } from '#app';

export default defineComponent({
    async setup() {
        const route = useRoute();

        const entity = ref<null | Event>(null);

        const httpClient = injectTelemetryHTTPClient();
        try {
            entity.value = await httpClient.event.getOne(route.params.id as string);
        } catch (e) {
            await navigateTo({ path: '/admin/events' });
            throw createError({});
        }

        return {
            entity: entity.value as Event,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <i class="fa-solid fa-bullhorn" />
            Event
            <span class="sub-title">{{ entity.id }}</span>
        </h1>

        <NuxtPage
            :entity="entity"
        />
    </div>
</template>
