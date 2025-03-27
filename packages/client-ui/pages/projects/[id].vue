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
import { createEntityManager, injectCoreHTTPClient } from '@privateaim/client-vue';
import { PermissionName } from '@privateaim/kit';
import type { Ref } from 'vue';
import {
    computed, defineComponent, ref,
} from 'vue';
import {
    definePageMeta,
    useToast,
} from '#imports';
import {
    createError, navigateTo, useRoute,
} from '#app';
import DomainEntityNav from '../../components/DomainEntityNav';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';

export default defineComponent({
    components: { DomainEntityNav },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const toast = useToast();
        const route = useRoute();
        const store = injectStore();
        const api = injectCoreHTTPClient();

        const canEdit = usePermissionCheck({ name: PermissionName.PROJECT_UPDATE });

        const manager = createEntityManager<`${DomainType.PROJECT}`>({
            type: `${DomainType.PROJECT}`,
            props: {
                entityId: useRoute().params.id as string,
            },
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

        if (manager.data.value.realm_id !== store.realmId) {
            const response = await api.projectNode.getMany({
                filter: {
                    project_id: manager.data.value.id,
                    node_realm_id: store.realmId,
                },
            });

            const data = response.data.pop();

            if (data) {
                projectNode.value = data;
            }
        }

        // todo: maybe ref of store.realmId
        const isProjectOwner = computed(() => manager.data.value && store.realmId === manager.data.value.realm_id);

        const isNodeAuthority = computed(() => !!projectNode.value);

        const backLink = computed(() => {
            if (typeof route.query.refPath === 'string') {
                return route.query.refPath;
            }

            return '/projects';
        });

        const tabs = computed(() => {
            const items = [
                { name: 'Overview', icon: 'fas fa-bars', path: '' },

            ];

            if (isProjectOwner.value || isNodeAuthority.value) {
                items.push({ name: 'Analyses', icon: 'fas fa-microscope', path: '/analyses' });
            }

            if (
                isProjectOwner.value &&
                canEdit.value
            ) {
                items.push({ name: 'Settings', icon: 'fa fa-cog', path: '/settings' });
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
        <h1 class="title no-border mb-3">
            <i class="fas fa-project-diagram" /> {{ entity.name }}
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="flex-wrap flex-row d-flex align-items-center">
                <DomainEntityNav
                    :items="tabs"
                    :path="'/projects/' + entity.id"
                    :prev-link="true"
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
