<script lang="ts">
import type { Policy } from '@authup/core-kit';
import { PermissionName as AuthupPermissionName } from '@authup/core-kit';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { useToast } from '../../../composables/toast';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
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

        const items = [
            {
                name: 'overview',
                path: '',
                icon: 'fa6-solid:bars',
            },
            {
                name: 'add',
                path: '/add',
                icon: 'fa6-solid:plus',
            },
        ];

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
            handleDeleted,
            handleFailed,
            items,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <VCIcon
                name="fa6-solid:scale-balanced"
                class="me-1"
            /> Policy
            <span class="sub-title ms-1">Management</span>
        </h1>
        <div class="content-wrapper">
            <div class="content-sidebar flex-col">
                <DomainEntityNav
                    :items="items"
                    path="/admin/policies"
                    direction="vertical"
                />
            </div>
            <div class="content-container">
                <NuxtPage
                    @deleted="handleDeleted"
                    @failed="handleFailed"
                />
            </div>
        </div>
    </div>
</template>
