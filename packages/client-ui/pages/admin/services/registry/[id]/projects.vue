<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { PermissionName } from '@privateaim/kit';
import type { PropType } from 'vue';
import type { Realm } from '@authup/core-kit';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../../config/layout';

export default defineNuxtComponent({
    props: {
        entity: {
            type: Object as PropType<Realm>,
            required: true,
        },
    },
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.REGISTRY_MANAGE,
            ],
        });
    },
});
</script>
<template>
    <NuxtPage :entity="entity" />
</template>
