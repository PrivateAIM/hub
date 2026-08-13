<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs, usePermissionCheck } from '@authup/client-web-kit';
import { PermissionName } from '@privateaim/kit';
import type { ProjectNode } from '@privateaim/core-kit';
import { ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import type { QueryBuildInput } from '@rapiq/core';
import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import type { SegmentItem } from '@privateaim/client-vue';
import {
    FPagination,
    FProjectNodeInCard,
    FProjectNodeInCardSkeleton,
    FProjectNodes,
    FSegments,
    FTitle,
    injectCoreHTTPClient,
} from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    components: {
        FPagination,
        FSegments,
        FTitle,
        FProjectNodes,
        FProjectNodeInCard,
        FProjectNodeInCardSkeleton,
    },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.PROJECT_APPROVE,
            ],
        });

        const api = injectCoreHTTPClient();
        const store = injectStore();
        const { realmId } = storeToRefs(store);

        const canManage = usePermissionCheck({ name: PermissionName.PROJECT_APPROVE });

        const nodeId : Ref<string | null> = ref(null);

        const segment : Ref<string> = ref('pending');
        const segments : SegmentItem[] = [
            {
                key: 'pending',
                label: 'Pending',
                emphasis: true,
            },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
        ];

        const query = computed<QueryBuildInput<ProjectNode, 3>>(() => ({
            filters: {
                approvalStatus: segment.value === 'pending' ?
                    null :
                    segment.value as ProjectNodeApprovalStatus,
            },
            sort: { updatedAt: 'DESC' },
        }));

        const listNode = ref<null | typeof FProjectNodes>(null);

        // Registered before the await below — vue/no-watch-after-await.
        // flush: 'post' — the list re-reads its `query` prop inside load();
        // with the default pre-render flush the new segment filter has not
        // been pushed into the child yet (stale-filter reload).
        watch(segment, () => {
            if (listNode.value) {
                listNode.value.load({ pagination: { offset: 0 } });
            }
        }, { flush: 'post' });

        try {
            const response = await api.node.getMany({ filters: { realmId: realmId.value } });

            const node = response.data.pop();
            if (node) {
                nodeId.value = node.id;
            }
        } catch {
            // do nothing :)
        }

        const handleUpdated = (item: ProjectNode) => {
            if (listNode.value) {
                listNode.value.handleUpdated(item);
            }
        };

        const handleFailed = () => {
            // todo: handle error
        };

        return {
            realmId,
            nodeId,
            segment,
            segments,
            query,
            handleFailed,
            handleUpdated,
            canManage,
            listNode,
        };
    },
});
</script>
<template>
    <div>
        <div class="m-t-10 entity-cards">
            <FProjectNodes
                ref="listNode"
                :direction="'in'"
                :target="'project'"
                :realm-id="realmId"
                :source-id="nodeId ?? undefined"
                :include-project="true"
                :include-node="true"
                :query="query"
            >
                <template #header>
                    <FTitle />
                    <div class="mb-3 mt-1">
                        <FSegments
                            v-model="segment"
                            :items="segments"
                        />
                    </div>
                </template>
                <template #loading>
                    <FProjectNodeInCardSkeleton
                        v-for="index in 2"
                        :key="index"
                    />
                </template>
                <template #footer="props">
                    <FPagination
                        :load="props.load"
                        :meta="props.meta"
                    />
                </template>
                <template #item="props">
                    <FProjectNodeInCard
                        :key="props.data.id"
                        :entity="props.data"
                        @updated="handleUpdated"
                    />
                </template>
            </FProjectNodes>
        </div>
    </div>
</template>
