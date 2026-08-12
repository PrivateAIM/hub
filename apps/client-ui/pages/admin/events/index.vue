<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { PermissionName } from '@privateaim/kit';
import { VCIcon } from '@vuecs/icon';
import { VCBreadcrumb } from '@vuecs/navigation';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent } from '#app';
import { useSectionBreadcrumb } from '../../../composables/breadcrumb';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    components: { VCBreadcrumb, VCIcon },
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.EVENT_READ,
                PermissionName.EVENT_DELETE,
            ],
        });

        const breadcrumbItems = useSectionBreadcrumb({
            root: {
                label: 'Admin', 
                url: '/admin', 
                icon: 'fa6-solid:gear', 
            },
            section: {
                label: 'Events', 
                url: '/admin/events', 
                icon: 'fa6-solid:bullhorn', 
            },
        });

        const toast = useToast();

        const handleDeleted = () => {
            toast.show({ variant: 'success', body: 'The event was successfully deleted.' });
        };

        const handleFailed = (e: Error) => {
            toast.show({ variant: 'warning', body: e.message });
        };

        return {
            breadcrumbItems,
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

        <div class="mb-2">
            <h1 class="title no-border mb-0">
                <VCIcon
                    name="fa6-solid:bullhorn"
                    class="me-1"
                /> Events
            </h1>
            <p class="mt-1 text-sm text-fg-muted">
                Domain events emitted across Hub services
            </p>
        </div>
        <div>
            <NuxtPage
                @deleted="handleDeleted"
                @failed="handleFailed"
            />
        </div>
    </div>
</template>
