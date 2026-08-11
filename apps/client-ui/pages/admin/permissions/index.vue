<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">

import { usePermissionCheck } from '@authup/client-web-kit';
import type { Permission } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { FContentAction } from '@privateaim/client-vue';
import { VCBreadcrumb } from '@vuecs/navigation';
import { VCIcon } from '@vuecs/icon';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent } from '#app';
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
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.PERMISSION_UPDATE,
                PermissionName.PERMISSION_DELETE,
                PermissionName.PERMISSION_CREATE,
            ],
        });

        const breadcrumbItems = useSectionBreadcrumb({
            root: {
                label: 'Admin', 
                url: '/admin', 
                icon: 'fa6-solid:gear', 
            },
            section: {
                label: 'Permissions', 
                url: '/admin/permissions', 
                icon: 'fa6-solid:users', 
            },
            children: [
                {
                    url: '/admin/permissions/add', 
                    label: 'Add', 
                    icon: 'fa6-solid:plus', 
                },
            ],
        });

        const canCreate = usePermissionCheck({ name: PermissionName.PERMISSION_CREATE });

        const handleDeleted = (e: Permission) => {
            const toast = useToast();
            toast.show({ variant: 'success', body: `The permission ${e.name} was successfully deleted.` });
        };

        const handleFailed = (e: Error) => {
            const toast = useToast();
            toast.show({ variant: 'warning', body: e.message });
        };

        return {
            breadcrumbItems,
            canCreate,
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
        />

        <div class="flex flex-row flex-wrap gap-3 items-center justify-between mb-2">
            <h1 class="title no-border mb-0">
                <VCIcon
                    name="fa6-solid:users"
                    class="me-1"
                /> Permission
                <span class="sub-title ms-1">Management</span>
            </h1>

            <FContentAction
                overview-url="/admin/permissions"
                add-url="/admin/permissions/add"
                :add-disabled="!canCreate"
            />
        </div>

        <NuxtPage
            @deleted="handleDeleted"
            @failed="handleFailed"
        />
    </div>
</template>
