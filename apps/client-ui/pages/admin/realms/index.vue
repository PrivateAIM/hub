<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import type { Realm } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent } from '#app';
import { FContentAction } from '@privateaim/client-vue';
import { VCBreadcrumb } from '@vuecs/navigation';
import { VCIcon } from '@vuecs/icon';
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
                PermissionName.REALM_UPDATE,
                PermissionName.REALM_READ,
                PermissionName.REALM_DELETE,
                PermissionName.REALM_CREATE,
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
                label: 'Realms', 
                url: '/admin/realms', 
                icon: 'fa6-solid:building', 
            },
            children: [
                {
                    url: '/admin/realms/add', 
                    label: 'Add', 
                    icon: 'fa6-solid:plus', 
                },
            ],
        });

        const canCreate = usePermissionCheck({ name: PermissionName.REALM_CREATE });

        const handleDeleted = (e: Realm) => {
            toast.show({ variant: 'success', body: `The realm ${e.name} was successfully deleted.` });
        };

        const handleFailed = (e: Error) => {
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
                    name="fa6-solid:building"
                    class="me-1"
                /> Realm
                <span class="sub-title ms-1">Management</span>
            </h1>

            <FContentAction
                overview-url="/admin/realms"
                add-url="/admin/realms/add"
                :add-disabled="!canCreate"
            />
        </div>

        <NuxtPage
            @deleted="handleDeleted"
            @failed="handleFailed"
        />
    </div>
</template>
