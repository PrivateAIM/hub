<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import {
    DomainType,
} from '@privateaim/core-kit';
import { FDisplayName, createEntityManager } from '@privateaim/client-vue';
import { PermissionName } from '@privateaim/kit';
import type { BreadcrumbItem, NavigationItem } from '@vuecs/navigation';
import { VCBreadcrumb } from '@vuecs/navigation';
import { VCIcon } from '@vuecs/icon';
import { isClientErrorWithStatusCode } from 'hapic';
import { computed, defineComponent } from 'vue';
import { definePageMeta, useToast } from '#imports';
import {
    createError,
    navigateTo,
    useRoute,
} from '#app';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';

export default defineComponent({
    components: {
        FDisplayName, 
        VCBreadcrumb, 
        VCIcon, 
    },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const toast = useToast();

        const canEdit = usePermissionCheck({ name: PermissionName.ANALYSIS_UPDATE });

        const manager = createEntityManager({
            type: DomainType.ANALYSIS,
            props: {
                entityId: useRoute('analyses-id').params.id as string,
                // Hydrates the project so the breadcrumb can name it without a
                // second request.
                query: { relations: { project: true } },
            },
            onFailed(e) {
                if (toast) {
                    toast.show({ variant: 'warning', body: e.message });
                }
            },
        });

        await manager.resolve();

        if (!manager.data.value) {
            if (isClientErrorWithStatusCode(manager.error, 404)) {
                // Analyses have no collection route of their own — they are
                // reached through their project. The entity did not resolve,
                // so its `projectId` is unknown and the project list is the
                // nearest thing that exists.
                await navigateTo({ path: '/projects' });
            }

            throw createError({});
        }

        /**
         * Built from the RESOLVED analysis, never from url segments: the route
         * carries only the analysis id, and `analysis.projectId` is the
         * authoritative owner. That also means the trail is identical for an
         * incoming analysis, where the project belongs to another realm.
         */
        const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
            const analysis = manager.data.value;
            if (!analysis) {
                return [];
            }

            const { project } = analysis;

            return [
                {
                    label: 'Projects',
                    to: '/projects',
                    icon: 'fa6-solid:diagram-project',
                },
                {
                    label: project?.displayName || project?.name || 'Project',
                    to: `/projects/${analysis.projectId}`,
                },
                {
                    label: 'Analyses',
                    to: `/projects/${analysis.projectId}/analyses`,
                    icon: 'fa6-solid:microscope',
                },
                {
                    label: analysis.displayName || analysis.name,
                    current: true,
                },
            ];
        });

        const tabs = computed<NavigationItem[]>(() => {
            const base = `/analyses/${manager.data.value?.id}`;

            // No back arrow: the breadcrumb's "Analyses" crumb points at the
            // same place, and two back affordances on one page is one too many.
            const items: NavigationItem[] = [
                {
                    name: 'Overview',
                    icon: 'fa6-solid:bars',
                    url: base,
                },
                {
                    name: 'Nodes',
                    icon: 'fa6-solid:city',
                    url: `${base}/nodes`,
                },
                {
                    name: 'Code',
                    icon: 'fa6-solid:code',
                    url: `${base}/code-files`,
                },
                {
                    name: 'Image',
                    icon: 'fa6-solid:compact-disc',
                    url: `${base}/image`,
                },
                {
                    name: 'Results',
                    icon: 'fa6-solid:chart-bar',
                    url: `${base}/result-files`,
                },
            ];

            if (canEdit.value) {
                items.push({
                    name: 'Settings',
                    icon: 'fa6-solid:gear',
                    url: `${base}/settings`,
                });
            }

            return items;
        });

        return {
            breadcrumbItems,
            tabs,
            entity: manager.data,
            handleFailed: manager.failed,
            handleUpdated: manager.updated,
        };
    },
});
</script>
<template>
    <div>
        <VCBreadcrumb
            v-if="entity"
            :items="breadcrumbItems"
        />

        <h1 class="title no-border mb-2">
            <VCIcon name="fa6-solid:microscope" /> Analysis
            <span class="sub-title">
                <template v-if="entity">
                    <FDisplayName
                        :name="entity.name"
                        :display-name="entity.displayName"
                    />
                </template>
                <template v-else>
                    ...
                </template>
            </span>
        </h1>

        <div v-if="entity">
            <div class="flex-wrap flex-row flex items-center">
                <VCNavItems
                    :data="tabs"
                    variant="pills"
                />
            </div>
        </div>

        <template v-if="entity">
            <div class="flex flex-col gap-1">
                <hr>

                <div>
                    <NuxtPage
                        :entity="entity"
                        @updated="handleUpdated"
                        @failed="handleFailed"
                    />
                </div>
            </div>
        </template>
        <template v-else>
            Not found...
        </template>
    </div>
</template>
