<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import type { Policy } from '@authup/core-kit';
import { PermissionName as AuthupPermissionName } from '@authup/core-kit';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { FContentAction } from '@privateaim/client-vue';
import { VCBreadcrumb } from '@vuecs/navigation';
import { VCIcon } from '@vuecs/icon';
import { useToast } from '../../../composables/toast';
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
                AuthupPermissionName.PERMISSION_READ,
                AuthupPermissionName.PERMISSION_UPDATE,
                AuthupPermissionName.PERMISSION_DELETE,
                AuthupPermissionName.PERMISSION_CREATE,
            ],
        });

        const toast = useToast();

        // A policy IS a permission record in authup, hence the PERMISSION_* gate.
        const breadcrumbItems = useSectionBreadcrumb({
            root: {
                label: 'Admin', 
                url: '/admin', 
                icon: 'fa6-solid:gear', 
            },
            section: {
                label: 'Policies', 
                url: '/admin/policies', 
                icon: 'fa6-solid:scale-balanced', 
            },
            children: [
                {
                    url: '/admin/policies/add', 
                    label: 'Add', 
                    icon: 'fa6-solid:plus', 
                },
            ],
        });

        const canCreate = usePermissionCheck({ name: AuthupPermissionName.PERMISSION_CREATE });

        const handleDeleted = (e: Policy) => {
            if (toast) {
                toast.show({ variant: 'success', body: `The policy ${e.name} was successfully deleted.` });
            }
        };

        const handleFailed = (e: Error) => {
            if (toast) {
                toast.show({ variant: 'warning', body: e.message });
            }
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
                    name="fa6-solid:scale-balanced"
                    class="me-1"
                /> Policy
                <span class="sub-title ms-1">Management</span>
            </h1>

            <FContentAction
                overview-url="/admin/policies"
                add-url="/admin/policies/add"
                :add-disabled="!canCreate"
            />
        </div>

        <NuxtPage
            @deleted="handleDeleted"
            @failed="handleFailed"
        />
    </div>
</template>
