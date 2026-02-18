<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import {
    DomainType,
} from '@privateaim/core-kit';
import { FAnalysisName, createEntityManager } from '@privateaim/client-vue';
import { isClientErrorWithStatusCode } from 'hapic';
import { defineComponent } from 'vue';
import { definePageMeta, useToast } from '#imports';
import {
    createError, navigateTo, useRoute,
} from '#app';
import DomainEntityNav from '../../components/DomainEntityNav';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';
import { DomainEntityNavItem } from '../../core';

export default defineComponent({
    components: {
        DomainEntityNav,
        DomainEntityNavItem,
        FAnalysisName,
    },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const toast = useToast();

        const manager = createEntityManager({
            type: `${DomainType.ANALYSIS}`,
            props: {
                entityId: useRoute().params.id as string,
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
                await navigateTo({
                    path: '/analyses',
                });
            }

            throw createError({});
        }

        const tabs = [
            { name: 'Overview', icon: 'fas fa-bars', path: '' },
            { name: 'Nodes', icon: 'fa fa-city', path: '/nodes' },
            { name: 'Code', icon: 'fa fa-code', path: '/code-files' },
            { name: 'Image', icon: 'fa fa-compact-disc', path: '/image' },
            { name: 'Security', icon: 'fa fa-lock', path: '/security' },
            { name: 'Results', icon: 'fas fa-chart-bar', path: '/result-files' },
        ];

        return {
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
        <h1 class="title no-border mb-3">
            <i class="fas fa-microscope" /> Analysis
            <span class="sub-title">
                <template v-if="entity">
                    <FAnalysisName
                        :entity-id="entity.id"
                        :entity-name="entity.name"
                    />
                </template>
                <template v-else>
                    ...
                </template>
            </span>
        </h1>

        <div v-if="entity">
            <div class="flex-wrap flex-row d-flex align-items-center">
                <DomainEntityNav
                    :items="tabs"
                    :path="'/analyses/' + entity.id"
                >
                    <template #before>
                        <DomainEntityNavItem
                            :path="'/projects/'+entity.project_id+'/analyses'"
                            :icon="'fa fa-arrow-left'"
                        />
                    </template>
                </DomainEntityNav>
            </div>
        </div>

        <template v-if="entity">
            <div class="d-flex flex-column gap-1">
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
