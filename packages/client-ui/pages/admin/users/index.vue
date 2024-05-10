<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { User } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.USER_EDIT,
                PermissionName.USER_ADD,
                PermissionName.USER_DROP,
            ],
        });

        const items = [
            {
                name: 'overview',
                urlSuffix: '',
                icon: 'fa fa-bars',
            },
            {
                name: 'add',
                urlSuffix: '/add',
                icon: 'fa fa-plus',
            },
        ];

        const handleDeleted = (e: User) => {
            const toast = useToast();
            toast.show({ variant: 'success', body: `The user ${e.name} was successfully deleted.` });
        };

        const handleFailed = (e: Error) => {
            const toast = useToast();
            toast.show({ variant: 'warning', body: e.message });
        };

        return {
            items,
            handleFailed,
            handleDeleted,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <i class="fa fa-user me-1" /> User
            <span class="sub-title ms-1">
                Management
            </span>
        </h1>
        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <DomainEntityNav
                    :items="items"
                    path="/admin/users"
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
