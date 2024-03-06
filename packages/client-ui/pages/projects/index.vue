<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Project } from '@privateaim/core';
import { defineNuxtComponent, navigateTo } from '#app';
import { definePageMeta, useToast } from '#imports';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const tabs = [
            {
                name: 'Create',
                urlSuffix: '/add',
                icon: 'fa fa-plus',
            },
            {
                name: 'Outgoing',
                urlSuffix: '',
                icon: 'fa fa-file-export',
            },
            {
                name: 'Incoming',
                urlSuffix: '/in',
                icon: 'fa fa-file-import',
            },
        ];

        const toast = useToast();

        const handleCreated = (entity: Project) => {
            toast.show({ variant: 'success', body: 'The project was successfully created.' });

            navigateTo({
                path: `/projects/${entity.id}`,
            });
        };

        return {
            handleCreated,
            tabs,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <i class="fas fa-tasks" /> Projects
            <span class="sub-title">Manage incoming & outgoing projects</span>
        </h1>

        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <DomainEntityNav
                    :items="tabs"
                    :path="'/projects'"
                    :direction="'vertical'"
                />
            </div>
            <div class="content-container">
                <NuxtPage @created="handleCreated" />
            </div>
        </div>
    </div>
</template>
