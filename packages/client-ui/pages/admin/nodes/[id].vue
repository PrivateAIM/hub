<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { createEntityManager } from '@privateaim/client-vue';
import type {
    Node,
} from '@privateaim/core';
import {
    DomainType,
} from '@privateaim/core';
import {
    useRoute,
    useToast,
} from '#imports';
import { createError, defineNuxtComponent, navigateTo } from '#app';

export default defineNuxtComponent({
    async setup() {
        const toast = useToast();

        const route = useRoute();

        const manager = createEntityManager({
            type: `${DomainType.NODE}`,
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
                    toast.show({ variant: 'success', body: 'The node was successfully updated.' });
                }
            },
        });

        await manager.resolve({
            query: {
                fields: [
                    '+registry_id',
                    '+registry_project_id',
                    '+email',
                    '+external_name',
                ],
            },
        });

        if (!manager.data.value) {
            await navigateTo({ path: '/admin/nodes' });
            throw createError({});
        }

        const tabs = [
            { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
            { name: 'Robot', icon: 'fas fa-robot', urlSuffix: 'robot' },
            { name: 'Registry', icon: 'fab fa-docker', urlSuffix: 'registry' },
        ];

        return {
            tabs,
            entity: manager.data.value as Node,
            handleUpdated: manager.updated,
            handleFailed: manager.failed,
        };
    },
});
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            {{ entity.name }} <span class="sub-title">Details</span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="flex-wrap flex-row d-flex">
                <DomainEntityNav
                    :items="tabs"
                    :path="'/admin/nodes/' + entity.id"
                    :prev-link="true"
                />
            </div>
        </div>
        <NuxtPage
            :entity="entity"
            @updated="handleUpdated"
            @failed="handleFailed"
        />
    </div>
</template>
