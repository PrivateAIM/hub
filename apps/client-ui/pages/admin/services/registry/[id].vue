<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { DomainType } from '@privateaim/core-kit';
import { createEntityManager } from '@privateaim/client-vue';
import { PermissionName } from '@privateaim/kit';
import type { NavigationItem } from '@vuecs/navigation';
import { VCIcon } from '@vuecs/icon';
import { computed, defineComponent } from 'vue';
import {
    createError,
    definePageMeta,
    navigateTo,
    useRoute,
    useToast,
} from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineComponent({
    components: { VCIcon },
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.REGISTRY_MANAGE,
            ],
        });

        const toast = useToast();
        const route = useRoute('admin-services-registry-id');

        const manager = createEntityManager({
            type: `${DomainType.REGISTRY}`,
            props: { entityId: route.params.id as string },
            onFailed(e) {
                if (toast) {
                    toast.show({ body: e.message }, { pos: 'top-center' });
                }
            },
            onUpdated() {
                if (toast) {
                    toast.show({ variant: 'success', body: 'The registry was successfully updated.' });
                }
            },
            onDeleted() {
                if (toast) {
                    toast.show({ variant: 'success', body: 'The registry was successfully deleted.' });
                }

                return navigateTo('/admin/services/registry');
            },
        });

        await manager.resolve({ query: { fields: ['+accountSecret'] } });

        if (!manager.data.value) {
            await navigateTo({ path: '/admin/services/registry' });
            throw createError({});
        }

        const tabs = computed<NavigationItem[]>(() => {
            const base = `/admin/services/registry/${manager.data.value?.id}`;

            return [
                {
                    name: '',
                    icon: 'fa6-solid:arrow-left',
                    url: '/admin/services/registry',
                },
                {
                    name: 'General',
                    icon: 'fa6-solid:bars',
                    url: base,
                },
                ...(
                    manager.data.value ?
                        [
                            {
                                name: 'Cleanup',
                                icon: 'fa6-solid:hands-bubbles',
                                url: `${base}/cleanup`,
                            },
                            {
                                name: 'Setup',
                                icon: 'fa6-solid:gear',
                                url: `${base}/setup`,
                            },
                        ] : []
                ),
                {
                    // Leaf on purpose: this strip is a horizontal `variant="pills"`
                    // segmented control, whose submenus render as an inline
                    // `Collapsible` (`orientation` is unset ⇒ collapse mode). A
                    // `children` array here would expand a vertical sub-list INSIDE
                    // the pill strip and turn the segment into a non-navigable
                    // `<button>` trigger. The overview/add sub-navigation lives in
                    // `[id]/projects.vue` as its own vertical sidebar instead —
                    // the same shape as `projects/[id]/analyses.vue`.
                    name: 'Projects',
                    icon: 'fa6-solid:diagram-project',
                    url: `${base}/projects`,
                    // Without this, `/projects/add` and `/projects/:id` only
                    // score a prefix match — the same score the back arrow and
                    // "General" get from their own prefixes — and the first
                    // item wins the tie, lighting up the back arrow instead.
                    activeMatch: `${base}/projects`,
                },
            ];
        });

        return {
            handleUpdated: manager.updated,
            handleDeleted: manager.deleted,
            tabs,
            entity: manager.data.value,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <VCIcon
                name="fa6-brands:docker"
                class="me-1"
            /> {{ entity.name }}
            <span class="sub-title ms-1">Details</span>
        </h1>

        <div class="mb-2">
            <VCNavItems
                :data="tabs"
                variant="pills"
            />
        </div>

        <div>
            <NuxtPage
                :entity="entity"
                @updated="handleUpdated"
                @deleted="handleDeleted"
            />
        </div>
    </div>
</template>
