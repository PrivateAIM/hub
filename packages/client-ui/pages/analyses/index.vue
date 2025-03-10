<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis } from '@privateaim/core-kit';
import { defineNuxtComponent } from '#app';
import { definePageMeta, navigateTo, useToast } from '#imports';
import DomainEntityNav from '../../components/DomainEntityNav';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';

export default defineNuxtComponent({
    components: { DomainEntityNav },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });
        const items = [
            {
                name: 'Create',
                path: '/add',
                icon: 'fa fa-plus',
            },
            {
                name: 'Outgoing',
                path: '',
                icon: 'fa fa-file-export',
            },
            {
                name: 'Incoming',
                path: '/in',
                icon: 'fa fa-file-import',
            },
        ];

        const toast = useToast();

        const handleCreated = async (entity: Analysis) => {
            toast.show({ variant: 'success', body: 'The analysis was successfully created.' });

            await navigateTo(`/analyses/${entity.id}/setup`);
        };

        return {
            handleCreated,
            items,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <i class="fas fa-microscope" /> Analyses
            <span class="sub-title">Manage incoming & outgoing analyses</span>
        </h1>

        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <DomainEntityNav
                    :items="items"
                    :path="'/analyses'"
                    :direction="'vertical'"
                />
            </div>
            <div class="content-container">
                <NuxtPage @created="handleCreated" />
            </div>
        </div>
    </div>
</template>
