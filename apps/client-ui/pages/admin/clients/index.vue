<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import type { Client } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { FContentAction } from '@privateaim/client-vue';
import { VCBreadcrumb } from '@vuecs/navigation';
import { VCIcon } from '@vuecs/icon';
import { defineNuxtComponent } from '#app';
import { definePageMeta, useToast } from '#imports';
import { useSectionBreadcrumb } from '../../../composables/breadcrumb';
import { LayoutKey } from '../../../config/layout';

export default defineNuxtComponent({
    components: {
        FContentAction, 
        VCBreadcrumb, 
        VCIcon, 
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.CLIENT_READ,
                PermissionName.CLIENT_UPDATE,
                PermissionName.CLIENT_DELETE,
                PermissionName.CLIENT_CREATE,
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
                label: 'Clients', 
                url: '/admin/clients', 
                icon: 'fa6-solid:ghost', 
            },
            children: [
                {
                    url: '/admin/clients/add', 
                    label: 'Add', 
                    icon: 'fa6-solid:plus', 
                },
            ],
        });

        const canCreate = usePermissionCheck({ name: PermissionName.CLIENT_CREATE });

        const handleDeleted = (e: Client) => {
            if (toast) {
                toast.show({ variant: 'success', body: `The client ${e.name} was successfully deleted.` });
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

        <div class="flex flex-row flex-wrap gap-3 items-start justify-between mb-2">
            <div class="mb-0">
                <h1 class="title no-border mb-0">
                    <VCIcon
                        name="fa6-solid:ghost"
                        class="me-1"
                    /> Clients
                </h1>
                <p class="mt-1 text-sm text-fg-muted">
                    Applications that authenticate against Hub
                </p>
            </div>

            <FContentAction
                overview-url="/admin/clients"
                add-url="/admin/clients/add"
                :add-disabled="!canCreate"
            />
        </div>

        <NuxtPage
            @deleted="handleDeleted"
            @failed="handleFailed"
        />
    </div>
</template>
