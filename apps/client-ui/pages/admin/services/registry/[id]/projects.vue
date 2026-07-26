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
import { computed, toRef } from 'vue';
import type { PropType } from 'vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../../config/layout';

export default defineNuxtComponent({
    props: {
        entity: {
            type: Object as PropType<Registry>,
            required: true,
        },
    },
    setup(props) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.REGISTRY_MANAGE,
            ],
        });

        const entity = toRef(props, 'entity');

        const tabs = computed<NavigationItem[]>(() => {
            const base = `/admin/services/registry/${entity.value.id}/projects`;

            return [
                {
                    name: 'overview',
                    icon: 'fa6-solid:bars',
                    url: base,
                },
                {
                    name: 'add',
                    icon: 'fa6-solid:plus',
                    url: `${base}/add`,
                },
            ];
        });

        return { tabs };
    },
});
</script>
<template>
    <div class="content-wrapper">
        <div class="content-sidebar flex-col">
            <VCNavItems
                :data="tabs"
                variant="pills"
                orientation="vertical"
            />
        </div>
        <div class="content-container">
            <NuxtPage :entity="entity" />
        </div>
    </div>
</template>
