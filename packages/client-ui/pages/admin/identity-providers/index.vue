<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">

import type { IdentityProvider } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.IDENTITY_PROVIDER_UPDATE,
                PermissionName.IDENTITY_PROVIDER_DELETE,
                PermissionName.IDENTITY_PROVIDER_CREATE,
                PermissionName.IDENTITY_PROVIDER_READ,
            ],
        });

        const items = [
            {
                name: 'overview',
                path: '',
                icon: 'fa fa-bars',
            },
            {
                name: 'add',
                path: 'add',
                icon: 'fa fa-plus',
            },
        ];

        const handleDeleted = (e: IdentityProvider) => {
            const toast = useToast();
            toast.show({ variant: 'success', body: `The identity-provider ${e.name} was successfully deleted.` });
        };

        const handleFailed = (e: Error) => {
            const toast = useToast();
            toast.show({ variant: 'warning', body: e.message });
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
            <i class="fa-solid fa-atom me-1" /> Identity Providers
            <span class="sub-title ms-1">Management</span>
        </h1>
        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <DomainEntityNav
                    :items="items"
                    path="/admin/identity-providers"
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
