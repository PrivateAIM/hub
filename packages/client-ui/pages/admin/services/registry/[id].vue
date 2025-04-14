<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { DomainType } from '@privateaim/core-kit';
import { createEntityManager } from '@privateaim/client-vue';
import { PermissionName } from '@privateaim/kit';
import { computed, defineComponent } from 'vue';
import {
    createError,
    definePageMeta,
    navigateTo, useRoute, useToast,
} from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';
import type { NavItems } from '../../../../core';

export default defineComponent({
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.REGISTRY_MANAGE,
            ],
        });

        const toast = useToast();
        const route = useRoute();

        const manager = createEntityManager({
            type: `${DomainType.REGISTRY}`,
            props: {
                entityId: route.params.id as string,
            },
            onFailed(e) {
                if (toast) {
                    toast.show({ body: e.message }, {
                        pos: 'top-center',
                    });
                }
            },
            onUpdated() {
                if (toast) {
                    toast.show({ variant: 'success', body: 'The registry was successfully updated.' });
                }
            },
            onDeleted() {
                if (toast) {
                    toast.show({ variant: 'success', body: 'The registry was successfully deleted.' });
                }

                return navigateTo('/admin/registries');
            },
        });

        await manager.resolve({
            query: {
                fields: ['+account_secret'],
            },
        });

        if (!manager.data.value) {
            await navigateTo({ path: '/admin/services/registries' });
            throw createError({});
        }

        const tabs = computed(() => [
            {
                name: 'General', icon: 'fas fa-bars', path: '',
            },
            ...(
                manager.data.value ?
                    [
                        {
                            name: 'Cleanup', icon: 'fa-solid fa-hands-bubbles', path: 'cleanup',
                        },
                        {
                            name: 'Setup', icon: 'fa-solid fa-cog', path: 'setup',
                        },
                    ] : []
            ),
            {
                name: 'Projects',
                icon: 'fa-solid fa-diagram-project',
                path: 'projects',
                children: [
                    {
                        name: 'overview',
                        path: '',
                        icon: 'fa fa-bars',
                    },
                    {
                        name: 'add',
                        path: '/add',
                        icon: 'fa fa-plus',
                    },
                ],
            },
        ] satisfies NavItems);

        return {
            handleUpdated: manager.updated,
            handleDeleted: manager.deleted,
            tabs,
            entity: manager.data.value,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <i class="fab fa-docker me-1" /> {{ entity.name }}
            <span class="sub-title ms-1">Details</span>
        </h1>

        <div class="mb-2">
            <DomainEntityNav
                :prev-link="true"
                :items="tabs"
                :path="'/admin/services/registry/' + entity.id "
            />
        </div>

        <div>
            <NuxtPage
                :entity="entity"
                @updated="handleUpdated"
                @deleted="handleDeleted"
            />
        </div>
    </div>
</template>
