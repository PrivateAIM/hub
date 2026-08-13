<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs, usePermissionCheck } from '@authup/client-web-kit';
import { computed, toRef } from 'vue';
import type { PropType } from 'vue';
import type { Project, ProjectNode } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { FContentAction } from '@privateaim/client-vue';
import type { NavigationItem } from '@vuecs/navigation';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { FContentAction },
    props: {
        entity: {
            type: Object as PropType<Project>,
            required: true,
        },
        visitorProjectNode: {
            type: Object as PropType<ProjectNode>,
            default: undefined,
        },
    },
    setup(props) {
        const entity = toRef(props, 'entity');

        const store = injectStore();
        const { realmId } = storeToRefs(store);

        const isOwner = computed(() => entity.value.realmId === realmId.value);

        const canCreate = usePermissionCheck({ name: PermissionName.ANALYSIS_CREATE });

        const base = computed(() => `/projects/${entity.value.id}/analyses`);

        // "Add" left the tab set for the row's right-hand action; only the two
        // real directions remain.
        const tabs = computed<NavigationItem[]>(() => [
            {
                name: 'Outgoing',
                icon: 'fa6-solid:file-export',
                url: base.value,
            },
            {
                name: 'Incoming',
                icon: 'fa6-solid:file-import',
                url: `${base.value}/in`,
            },
        ]);

        // Only the owning realm can add an analysis to the project — a node
        // authority sees the same view but read-only.
        const canAdd = computed(() => isOwner.value && canCreate.value);

        return {
            addUrl: computed(() => `${base.value}/add`),
            overviewUrl: base,
            canAdd,
            tabs,
        };
    },
});
</script>
<template>
    <div>
        <div class="flex flex-row flex-wrap gap-3 items-center justify-between mb-3">
            <div class="flex-wrap flex-row flex items-center">
                <VCNavItems
                    :data="tabs"
                    variant="pills"
                />
            </div>

            <FContentAction
                :overview-url="overviewUrl"
                :add-url="addUrl"
                :add-disabled="!canAdd"
            />
        </div>

        <NuxtPage
            :entity="entity"
            :visitor-project-node="visitorProjectNode"
        />
    </div>
</template>
