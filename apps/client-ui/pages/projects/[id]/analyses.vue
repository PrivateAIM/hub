<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs } from '@authup/client-web-kit';
import { computed, toRef } from 'vue';
import type { PropType } from 'vue';
import type { Project, ProjectNode } from '@privateaim/core-kit';
import type { NavigationItem } from '@vuecs/navigation';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
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

        const isOwner = computed(() => entity.value.realm_id === realmId.value);

        const tabs = computed<NavigationItem[]>(() => {
            const base = `/projects/${entity.value.id}/analyses`;

            return [
                {
                    name: 'Outgoing',
                    icon: 'fa6-solid:file-export',
                    url: base,
                },
                {
                    name: 'Incoming',
                    icon: 'fa6-solid:file-import',
                    url: `${base}/in`,
                },
                ...(isOwner.value ? [
                    {
                        name: 'Add',
                        icon: 'fa6-solid:plus',
                        url: `${base}/add`,
                    },
                ] : []),
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
            <NuxtPage
                :entity="entity"
                :visitor-project-node="visitorProjectNode"
            />
        </div>
    </div>
</template>
