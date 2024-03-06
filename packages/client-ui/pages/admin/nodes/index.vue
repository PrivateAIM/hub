<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { Node } from '@privateaim/core';
import { PermissionID } from '@privateaim/core';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent, navigateTo } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.NODE_EDIT,
                PermissionID.NODE_DROP,
                PermissionID.NODE_ADD,
            ],
        });

        const tabs = [
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

        const toast = useToast();

        const handleCreated = async (e: Node) => {
            toast.show({ variant: 'success', body: 'The node was successfully created.' });

            await navigateTo(`/admin/nodes/${e.id}`);
        };

        const handleDeleted = () => {
            toast.show({ variant: 'success', body: 'The node was successfully deleted.' });
        };

        const handleFailed = (e: Error) => {
            toast.show({ variant: 'warning', body: e.message });
        };

        return {
            handleCreated,
            handleDeleted,
            handleFailed,
            tabs,
        };
    },
});
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            Node <span class="sub-title">Management</span>
        </h1>
        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <DomainEntityNav
                    :direction="'vertical'"
                    :items="tabs"
                    :path="'/admin/nodes'"
                />
            </div>
            <div class="content-container">
                <NuxtPage
                    @created="handleCreated"
                    @deleted="handleDeleted"
                    @failed="handleFailed"
                />
            </div>
        </div>
    </div>
</template>
