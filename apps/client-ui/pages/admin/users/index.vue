<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import type { User } from '@authup/core-kit';
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
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.USER_UPDATE,
                PermissionName.USER_CREATE,
                PermissionName.USER_DELETE,
            ],
        });

        const breadcrumbItems = useSectionBreadcrumb({
            root: {
                label: 'Admin', 
                url: '/admin', 
                icon: 'fa6-solid:gear', 
            },
            section: {
                label: 'Users', 
                url: '/admin/users', 
                icon: 'fa6-solid:user', 
            },
            children: [
                {
                    url: '/admin/users/add', 
                    label: 'Add', 
                    icon: 'fa6-solid:plus', 
                },
            ],
        });

        const canCreate = usePermissionCheck({ name: PermissionName.USER_CREATE });

        const handleDeleted = (e: User) => {
            const toast = useToast();
            toast.show({ variant: 'success', body: `The user ${e.name} was successfully deleted.` });
        };

        const handleFailed = (e: Error) => {
            const toast = useToast();
            toast.show({ variant: 'warning', body: e.message });
        };

        return {
            breadcrumbItems,
            canCreate,
            handleFailed,
            handleDeleted,
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
                        name="fa6-solid:user"
                        class="me-1"
                    /> Users
                </h1>
                <p class="mt-1 text-sm text-fg-muted">
                    People with access to this realm
                </p>
            </div>

            <FContentAction
                overview-url="/admin/users"
                add-url="/admin/users/add"
                :add-disabled="!canCreate"
            />
        </div>

        <NuxtPage
            @deleted="handleDeleted"
            @failed="handleFailed"
        />
    </div>
</template>
