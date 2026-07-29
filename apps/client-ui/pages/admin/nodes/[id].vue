<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import { PermissionName } from '@authup/core-kit';
import { createEntityManager } from '@privateaim/client-vue';
import type {
    Node,
} from '@privateaim/core-kit';
import {
    DomainType,
} from '@privateaim/core-kit';
import { VCIcon } from '@vuecs/icon';
import type { NavigationItem } from '@vuecs/navigation';
import { computed, defineComponent } from 'vue';
import {
    useRoute,
    useToast,
} from '#imports';
import { createError, navigateTo } from '#app';

export default defineComponent({
    components: { VCIcon },
    async setup() {
        const toast = useToast();

        const route = useRoute();

        const manager = createEntityManager({
            type: `${DomainType.NODE}`,
            props: { entityId: route.params.id as string },
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
                    '+external_name',
                ],
            },
        });

        if (!manager.data.value) {
            await navigateTo({ path: '/admin/nodes' });
            throw createError({});
        }

        const entity = manager.data.value as Node;
        const base = `/admin/nodes/${entity.id}`;

        // The node's client is a plain authup client, so admins who may manage
        // clients are sent to the full client view. Everyone else — a node admin
        // holding NODE_UPDATE but no CLIENT_* permission — keeps the node-local
        // credential view, which goes through the node API instead.
        // One-of semantics: the checker evaluates the names as a disjunction.
        const canManageClient = usePermissionCheck({
            name: [
                PermissionName.CLIENT_READ,
                PermissionName.CLIENT_UPDATE,
                PermissionName.CLIENT_DELETE,
            ],
        });

        const tabs = computed<NavigationItem[]>(() => [
            {
                name: '',
                icon: 'fa6-solid:arrow-left',
                url: '/admin/nodes',
            },
            {
                name: 'Overview',
                icon: 'fa6-solid:bars',
                url: base,
            },
            {
                name: 'Crypto',
                icon: 'fa6-solid:shield-halved',
                url: `${base}/crypto`,
            },
            {
                name: 'Client',
                icon: 'fa6-solid:ghost',
                url: entity.client_id && canManageClient.value ?
                    `/admin/clients/${entity.client_id}` :
                    `${base}/client`,
            },
            {
                name: 'Registry',
                icon: 'fa6-brands:docker',
                url: `${base}/registry`,
            },
        ]);

        return {
            tabs,
            entity,
            handleUpdated: manager.updated,
            handleFailed: manager.failed,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <VCIcon name="fa6-solid:server" /> {{ entity.name }} <span class="sub-title">Details</span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="flex-wrap flex-row flex">
                <VCNavItems
                    :data="tabs"
                    variant="pills"
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
