<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type {
    Project,
    ProjectNode,
} from '@privateaim/core';
import {
    DomainType,
    PermissionID,
} from '@privateaim/core';
import { createEntityManager } from '@privateaim/client-vue';
import type { Ref } from 'vue';
import {
    computed, ref,
} from 'vue';
import {
    definePageMeta,
    useToast,
} from '#imports';
import {
    createError, defineNuxtComponent, navigateTo, useRoute,
} from '#app';
import DomainEntityNav from '../../components/DomainEntityNav';
import { useCoreAPI } from '../../composables/api';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';
import { useAuthStore } from '../../store/auth';

export default defineNuxtComponent({
    components: { DomainEntityNav },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const toast = useToast();

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
                return navigateTo('/proposals');
            },
        });

        await manager.resolve();

        if (!manager.data.value) {
            await navigateTo({ path: '/proposals' });
            throw createError({});
        }

        const store = useAuthStore();

        const projectNode : Ref<ProjectNode | null> = ref(null);

        if (manager.data.value.realm_id !== store.realmId) {
            const response = await useCoreAPI().projectNode.getMany({
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
        const isProposalOwner = computed(() => manager.data.value && store.realmId === manager.data.value.realm_id);

        const isStationAuthority = computed(() => !!projectNode.value);

        const route = useRoute();
        const backLink = computed(() => {
            if (typeof route.query.refPath === 'string') {
                return route.query.refPath;
            }

            return '/projects';
        });

        const tabs = computed(() => {
            const items = [
                { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },

            ];

            if (isProposalOwner.value || isStationAuthority.value) {
                items.push({ name: 'Analyses', icon: 'fas fa-train', urlSuffix: '/analyses' });
            }

            if (
                isProposalOwner.value &&
                store.has(PermissionID.PROJECT_EDIT)
            ) {
                items.push({ name: 'Settings', icon: 'fa fa-cog', urlSuffix: '/settings' });
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
            proposalStation: projectNode.value,
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
            📜 {{ entity.name }}
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <div class="flex-wrap flex-row d-flex align-items-center">
                        <DomainEntityNav
                            :items="tabs"
                            :path="'/projects/' + entity.id"
                            :prev-link="true"
                        />
                    </div>
                </div>
            </div>
        </div>

        <NuxtPage
            :entity="entity"
            :visitor-project-node="proposalStation"
            @deleted="handleDeleted"
            @updated="handleUpdated"
        />
    </div>
</template>
