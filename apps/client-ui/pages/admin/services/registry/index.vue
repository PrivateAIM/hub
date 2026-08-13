<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import type { Registry } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { FContentAction } from '@privateaim/client-vue';
import { VCBreadcrumb } from '@vuecs/navigation';
import type { NavigationItem } from '@vuecs/navigation';
import { VCIcon } from '@vuecs/icon';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent } from '#app';
import { useSectionBreadcrumb } from '../../../../composables/breadcrumb';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineNuxtComponent({
    components: {
        FContentAction, 
        VCBreadcrumb, 
        VCIcon, 
    },
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.REGISTRY_MANAGE,
            ],
        });

        const toast = useToast();

        const breadcrumbItems = useSectionBreadcrumb({
            root: {
                label: 'Admin', 
                url: '/admin', 
                icon: 'fa6-solid:gear', 
            },
            section: {
                label: 'Registry', 
                url: '/admin/services/registry', 
                icon: 'fa6-brands:docker', 
            },
            children: [
                {
                    url: '/admin/services/registry/add', 
                    label: 'Add', 
                    icon: 'fa6-solid:plus', 
                },
                {
                    url: '/admin/services/registry/client', 
                    label: 'Client', 
                    icon: 'fa6-solid:ghost', 
                },
            ],
        });

        const canCreate = usePermissionCheck({ name: PermissionName.REGISTRY_MANAGE });

        // "add" left the tab set for the title-row action; "client" is a real
        // sibling view, so the remainder stays as a horizontal pill row.
        const tabs: NavigationItem[] = [
            {
                name: 'Overview',
                url: '/admin/services/registry',
                icon: 'fa6-solid:bars',
            },
            {
                name: 'Client',
                url: '/admin/services/registry/client',
                icon: 'fa6-solid:ghost',
            },
        ];

        const handleDeleted = (item: Registry) => {
            toast.show({ variant: 'success', body: `The registry ${item.name} was successfully deleted.` });
        };

        return {
            breadcrumbItems,
            canCreate,
            handleDeleted,
            tabs,
        };
    },
});
</script>
<template>
    <div>
        <VCBreadcrumb
            :items="breadcrumbItems"
        />

        <div class="flex flex-row flex-wrap gap-3 items-start justify-between mb-2">
            <div class="mb-0">
                <h1 class="title no-border mb-0">
                    <VCIcon
                        name="fa6-brands:docker"
                        class="me-1"
                    /> Registry
                </h1>
                <p class="mt-1 text-sm text-fg-muted">
                    Docker registries analysis images are built into
                </p>
            </div>

            <FContentAction
                overview-url="/admin/services/registry"
                add-url="/admin/services/registry/add"
                :add-disabled="!canCreate"
            />
        </div>

        <div class="m-b-20 m-t-10">
            <div class="flex-wrap flex-row flex items-center">
                <VCNavItems
                    :data="tabs"
                    variant="pills"
                />
            </div>
        </div>

        <NuxtPage @deleted="handleDeleted" />
    </div>
</template>
