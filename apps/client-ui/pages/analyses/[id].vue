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
import type { NavigationItem } from '@vuecs/navigation';
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
    components: { FDisplayName },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const toast = useToast();

        const canEdit = usePermissionCheck({ name: PermissionName.ANALYSIS_UPDATE });

        const manager = createEntityManager({
            type: `${DomainType.ANALYSIS}`,
            props: { entityId: useRoute().params.id as string },
            onFailed(e) {
                if (toast) {
                    toast.show({ variant: 'warning', body: e.message });
                }
            },
        });

        await manager.resolve();

        if (!manager.data.value) {
            if (isClientErrorWithStatusCode(manager.error, 404)) {
                await navigateTo({ path: '/analyses' });
            }

            throw createError({});
        }

        const tabs = computed<NavigationItem[]>(() => {
            const base = `/analyses/${manager.data.value?.id}`;

            const items: NavigationItem[] = [
                {
                    name: '',
                    icon: 'fa6-solid:arrow-left',
                    url: `/projects/${manager.data.value?.project_id}/analyses`,
                },
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
                    name: 'Security',
                    icon: 'fa6-solid:lock',
                    url: `${base}/security`,
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
            <VCIcon name="fa6-solid:microscope" /> Analysis
            <span class="sub-title">
                <template v-if="entity">
                    <FDisplayName
                        :name="entity.name"
                        :display-name="entity.display_name"
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
