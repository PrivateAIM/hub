<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { defineNuxtComponent, definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });
    },
});
</script>
<template>
    <div>
        <div class="mb-3">
            <h1 class="title no-border mb-0">
                Admin
            </h1>
            <p class="mt-1 text-sm text-fg-muted">
                Realm, access and platform services
            </p>
        </div>
    </div>
</template>
