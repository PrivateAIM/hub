<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import { FContentAction } from '@privateaim/client-vue';
import type { Registry } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { computed, toRef } from 'vue';
import type { PropType } from 'vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../../config/layout';

export default defineNuxtComponent({
    components: { FContentAction },
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

        const canCreate = usePermissionCheck({ name: PermissionName.REGISTRY_MANAGE });

        // Only "overview" and "add" existed here, so nothing is left to tab
        // between — the action alone replaces the rail.
        const overviewUrl = computed(() => `/admin/services/registry/${entity.value.id}/projects`);

        return {
            addUrl: computed(() => `${overviewUrl.value}/add`),
            overviewUrl,
            canCreate,
        };
    },
});
</script>
<template>
    <div>
        <div class="flex flex-row flex-wrap gap-3 items-center justify-end mb-3">
            <FContentAction
                :overview-url="overviewUrl"
                :add-url="addUrl"
                :add-disabled="!canCreate"
            />
        </div>

        <NuxtPage :entity="entity" />
    </div>
</template>
