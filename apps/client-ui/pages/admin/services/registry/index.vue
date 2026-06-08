<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { Registry } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { NavigationItem } from '@vuecs/navigation';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.REGISTRY_MANAGE,
            ],
        });

        const toast = useToast();

        const tabs: NavigationItem[] = [
            {
                name: 'overview', 
                url: '/admin/services/registry', 
                icon: 'fa6-solid:bars', 
            },
            {
                name: 'add', 
                url: '/admin/services/registry/add', 
                icon: 'fa6-solid:plus', 
            },
            {
                name: 'client', 
                url: '/admin/services/registry/client', 
                icon: 'fa6-solid:ghost', 
            },
        ];

        const handleDeleted = (item: Registry) => {
            toast.show({ variant: 'success', body: `The registry ${item.name} was successfully deleted.` });
        };

        return {
            handleDeleted,
            tabs,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <VCIcon
                name="fa6-brands:docker"
                class="me-1"
            /> Registry
            <span class="sub-title ms-1">Management</span>
        </h1>
        <div class="content-wrapper">
            <div class="content-sidebar flex-col">
                <VCNavItems
                    :data="tabs"
                    variant="pills"
                    orientation="vertical"
                />
            </div>
            <div class="content-container">
                <NuxtPage @deleted="handleDeleted" />
            </div>
        </div>
    </div>
</template>
