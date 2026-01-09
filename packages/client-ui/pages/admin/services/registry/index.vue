<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { Registry } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
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

        const tabs = [
            {
                name: 'overview',
                path: '',
                icon: 'fa fa-bars',
            },
            {
                name: 'add',
                path: '/add',
                icon: 'fa fa-plus',
            },

            {
                name: 'client',
                path: '/client',
                icon: 'fa fa-robot',
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
            <i class="fab fa-docker me-1" /> Registry
            <span class="sub-title ms-1">Management</span>
        </h1>
        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <DomainEntityNav
                    :direction="'vertical'"
                    :items="tabs"
                    :path="'/admin/services/registry'"
                />
            </div>
            <div class="content-container">
                <NuxtPage @deleted="handleDeleted" />
            </div>
        </div>
    </div>
</template>
