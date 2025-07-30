<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { PermissionName } from '@privateaim/kit';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.EVENT_READ,
                PermissionName.EVENT_DELETE,
            ],
        });

        const toast = useToast();

        const handleDeleted = () => {
            toast.show({ variant: 'success', body: 'The event was successfully deleted.' });
        };

        const handleFailed = (e: Error) => {
            toast.show({ variant: 'warning', body: e.message });
        };

        return {
            handleDeleted,
            handleFailed,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <i class="fa-solid fa-bullhorn" /> Events <span class="sub-title">Management</span>
        </h1>
        <div>
            <NuxtPage
                @deleted="handleDeleted"
                @failed="handleFailed"
            />
        </div>
    </div>
</template>
