<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, usePermissionCheck } from '@authup/client-web-kit';
import type {
    Project,
    ProjectNode,
} from '@privateaim/core-kit';
import {
    DomainType,
} from '@privateaim/core-kit';
import { FDisplayName, createEntityManager, injectCoreHTTPClient } from '@privateaim/client-vue';
import { PermissionName } from '@privateaim/kit';
import { VCIcon } from '@vuecs/icon';
import type { BreadcrumbItem, NavigationItem } from '@vuecs/navigation';
import { VCBreadcrumb } from '@vuecs/navigation';
import type { Ref } from 'vue';
import {
    computed,
    defineComponent,
    ref,
} from 'vue';
import {
    definePageMeta,
    useToast,
} from '#imports';
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
        const route = useRoute('projects-id');
        const store = injectStore();
        const api = injectCoreHTTPClient();

        const canEdit = usePermissionCheck({ name: PermissionName.PROJECT_UPDATE });

        const manager = createEntityManager<`${DomainType.PROJECT}`, Project>({
            type: `${DomainType.PROJECT}`,
            props: { entityId: useRoute('projects-id').params.id as string },
            onUpdated() {
                if (toast) {
                    toast.show({ variant: 'success', body: 'The project was successfully updated.' });
                }
            },
            onFailed(e) {
                if (toast) {
                    toast.show({ variant: 'warning', body: e.message });
                }
            },
            onDeleted() {
                return navigateTo('/projects');
            },
        });

        await manager.resolve();

        if (!manager.data.value) {
            await navigateTo({ path: '/projects' });
            throw createError({});
        }

        const projectNode : Ref<ProjectNode | null> = ref(null);

        if (manager.data.value.realmId !== store.realmId) {
            const response = await api.projectNode.getMany({
                filters: {
                    projectId: manager.data.value.id,
                    nodeRealmId: store.realmId,
                },
            });

            const data = response.data.pop();

            if (data) {
                projectNode.value = data;
            }
        }

        // todo: maybe ref of store.realmId
        const isProjectOwner = computed(() => manager.data.value && store.realmId === manager.data.value.realmId);

        const isNodeAuthority = computed(() => !!projectNode.value);

        const backLink = computed(() => {
            if (typeof route.query.refPath === 'string') {
                return route.query.refPath;
            }

            return '/projects';
        });

        /**
         * Named from the RESOLVED project, not from url segments. The
         * sub-view crumb is derived from the route because those ARE the
         * page's own sections.
         *
         * This does not replace the back arrow below: the arrow honours
         * `refPath` and returns you to wherever you came from (Incoming, say),
         * which is a history affordance a hierarchical trail cannot express.
         */
        const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
            const project = manager.data.value;
            if (!project) {
                return [];
            }

            const items: BreadcrumbItem[] = [
                {
                    label: 'Projects',
                    to: '/projects',
                    icon: 'fa6-solid:diagram-project',
                },
                {
                    label: project.displayName || project.name,
                    to: `/projects/${project.id}`,
                },
            ];

            const base = `/projects/${project.id}`;
            const sections = [
                {
                    url: `${base}/analyses`, 
                    label: 'Analyses', 
                    icon: 'fa6-solid:microscope', 
                },
                {
                    url: `${base}/analyses/in`, 
                    label: 'Incoming', 
                    icon: 'fa6-solid:file-import', 
                },
                {
                    url: `${base}/analyses/add`, 
                    label: 'Add', 
                    icon: 'fa6-solid:plus', 
                },
                {
                    url: `${base}/settings`, 
                    label: 'Settings', 
                    icon: 'fa6-solid:gear', 
                },
            ];

            // `/analyses/in` also needs its `/analyses` ancestor, so collect
            // every section the current path sits under, shortest url first.
            const matched = sections
                .filter((s) => route.path === s.url || route.path.startsWith(`${s.url}/`))
                .sort((a, b) => a.url.length - b.url.length);

            for (const section of matched) {
                items.push({
                    label: section.label,
                    to: section.url,
                    icon: section.icon,
                });
            }

            return items;
        });

        const tabs = computed<NavigationItem[]>(() => {
            const base = `/projects/${manager.data.value?.id}`;

            const items: NavigationItem[] = [
                {
                    name: '',
                    icon: 'fa6-solid:arrow-left',
                    url: backLink.value,
                },
                {
                    name: 'Overview',
                    icon: 'fa6-solid:bars',
                    url: base,
                },
            ];

            if (isProjectOwner.value || isNodeAuthority.value) {
                items.push({
                    name: 'Analyses',
                    icon: 'fa6-solid:microscope',
                    url: `${base}/analyses`,
                });
            }

            if (
                isProjectOwner.value &&
                canEdit.value
            ) {
                items.push({
                    name: 'Settings',
                    icon: 'fa6-solid:gear',
                    url: `${base}/settings`,
                });
            }

            return items;
        });

        const handleUpdated = (data: Project) => {
            manager.updated(data);
        };

        const handleDeleted = async () => {
            manager.deleted();
        };

        return {
            breadcrumbItems,
            entity: manager.data.value,
            projectNode: projectNode.value,
            backLink,
            tabs,
            handleDeleted,
            handleUpdated,
        };
    },
});
</script>
<template>
    <div>
        <VCBreadcrumb
            :items="breadcrumbItems"
            class="mb-2"
        />

        <h1 class="title no-border mb-3">
            <VCIcon name="fa6-solid:diagram-project" />
            <FDisplayName
                :name="entity.name"
                :display-name="entity.displayName"
            />
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="flex-wrap flex-row flex items-center">
                <VCNavItems
                    :data="tabs"
                    variant="pills"
                />
            </div>
        </div>

        <NuxtPage
            :entity="entity"
            :visitor-project-node="projectNode"
            @deleted="handleDeleted"
            @updated="handleUpdated"
        />
    </div>
</template>
