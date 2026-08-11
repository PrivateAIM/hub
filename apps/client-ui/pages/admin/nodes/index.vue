<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import type { Node } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { FContentAction } from '@privateaim/client-vue';
import { VCBreadcrumb } from '@vuecs/navigation';
import { VCIcon } from '@vuecs/icon';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent, navigateTo } from '#app';
import { useSectionBreadcrumb } from '../../../composables/breadcrumb';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

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
                PermissionName.NODE_UPDATE,
                PermissionName.NODE_DELETE,
                PermissionName.NODE_CREATE,
            ],
        });

        const breadcrumbItems = useSectionBreadcrumb({
            root: {
                label: 'Admin', 
                url: '/admin', 
                icon: 'fa6-solid:gear', 
            },
            section: {
                label: 'Nodes', 
                url: '/admin/nodes', 
                icon: 'fa6-solid:server', 
            },
            children: [
                {
                    url: '/admin/nodes/add', 
                    label: 'Add', 
                    icon: 'fa6-solid:plus', 
                },
            ],
        });

        const canCreate = usePermissionCheck({ name: PermissionName.NODE_CREATE });

        const toast = useToast();

        const handleCreated = async (e: Node) => {
            toast.show({ variant: 'success', body: 'The node was successfully created.' });

            await navigateTo(`/admin/nodes/${e.id}`);
        };

        const handleDeleted = () => {
            toast.show({ variant: 'success', body: 'The node was successfully deleted.' });
        };

        const handleFailed = (e: Error) => {
            toast.show({ variant: 'warning', body: e.message });
        };

        return {
            breadcrumbItems,
            canCreate,
            handleCreated,
            handleDeleted,
            handleFailed,
        };
    },
});
</script>
<template>
    <div>
        <VCBreadcrumb
            :items="breadcrumbItems"
            class="mb-2"
        />

        <div class="flex flex-row flex-wrap gap-3 items-center justify-between mb-3">
            <h1 class="title no-border mb-0">
                <VCIcon name="fa6-solid:server" /> Node <span class="sub-title">Management</span>
            </h1>

            <FContentAction
                overview-url="/admin/nodes"
                add-url="/admin/nodes/add"
                :add-disabled="!canCreate"
            />
        </div>

        <NuxtPage
            @created="handleCreated"
            @deleted="handleDeleted"
            @failed="handleFailed"
        />
    </div>
</template>
