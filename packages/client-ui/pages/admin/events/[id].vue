<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { createEntityManager } from '@privateaim/client-vue';
import type {
    Event,
} from '@privateaim/core-kit';
import {
    DomainType,
} from '@privateaim/core-kit';
import { defineComponent } from 'vue';
import {
    useRoute,
    useToast,
} from '#imports';
import { createError, navigateTo } from '#app';

export default defineComponent({
    async setup() {
        const toast = useToast();

        const route = useRoute();

        const manager = createEntityManager({
            type: `${DomainType.EVENT}`,
            props: {
                entityId: route.params.id as string,
            },
            onFailed(e) {
                if (toast) {
                    toast.show({ variant: 'warning', body: e.message });
                }
            },
            onUpdated() {
                if (toast) {
                    toast.show({ variant: 'success', body: 'The event was successfully updated.' });
                }
            },
        });

        await manager.resolve();

        if (!manager.data.value) {
            await navigateTo({ path: '/admin/events' });
            throw createError({});
        }

        return {
            entity: manager.data.value as Event,
            handleUpdated: manager.updated,
            handleFailed: manager.failed,
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
            @updated="handleUpdated"
            @failed="handleFailed"
        />
    </div>
</template>
