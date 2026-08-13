<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import type { Role } from '@authup/core-kit';
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
                PermissionName.ROLE_UPDATE,
                PermissionName.ROLE_DELETE,
                PermissionName.ROLE_CREATE,
            ],
        });

        const breadcrumbItems = useSectionBreadcrumb({
            root: {
                label: 'Admin', 
                url: '/admin', 
                icon: 'fa6-solid:gear', 
            },
            section: {
                label: 'Roles', 
                url: '/admin/roles', 
                icon: 'fa6-solid:masks-theater', 
            },
            children: [
                {
                    url: '/admin/roles/add', 
                    label: 'Add', 
                    icon: 'fa6-solid:plus', 
                },
            ],
        });

        const canCreate = usePermissionCheck({ name: PermissionName.ROLE_CREATE });

        const handleDeleted = (e: Role) => {
            const toast = useToast();
            toast.show({ variant: 'success', body: `The role ${e.name} was successfully deleted.` });
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

        <div class="flex flex-row flex-wrap gap-3 items-start justify-between mb-2">
            <div class="mb-0">
                <h1 class="title no-border mb-0">
                    <VCIcon
                        name="fa6-solid:masks-theater"
                        class="me-1"
                    /> Roles
                </h1>
                <p class="mt-1 text-sm text-fg-muted">
                    Named bundles of permissions, assigned to users and clients
                </p>
            </div>

            <FContentAction
                overview-url="/admin/roles"
                add-url="/admin/roles/add"
                :add-disabled="!canCreate"
            />
        </div>

        <NuxtPage
            @deleted="handleDeleted"
            @failed="handleFailed"
        />
    </div>
</template>
