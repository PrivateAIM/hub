<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs, usePermissionCheck } from '@authup/client-web-kit';
import { PermissionName } from '@privateaim/kit';
import type { AnalysisNode } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import type { QueryBuildInput } from '@rapiq/core';
import type { Ref } from 'vue';
import {
    computed, 
    ref, 
    useTemplateRef, 
    watch,
} from 'vue';
import type { SegmentItem } from '@privateaim/client-vue';
import {
    FAnalysisNodeInCard,
    FAnalysisNodeInCardSkeleton,
    FAnalysisNodes,
    FPagination,
    FSearch,
    FSegments,
    FTitle,
    injectCoreHTTPClient,
} from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    components: {
        ListPagination: FPagination,
        ListSearch: FSearch,
        ListTitle: FTitle,
        FAnalysisNodeInCard,
        FAnalysisNodeInCardSkeleton,
        FAnalysisNodes,
        FSegments,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.ANALYSIS_APPROVE,
            ],
        });


        const api = injectCoreHTTPClient();

        const store = injectStore();
        const { realmId } = storeToRefs(store);

        const canManage = usePermissionCheck({ name: PermissionName.ANALYSIS_APPROVE });

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

        const query = computed<QueryBuildInput<AnalysisNode, 3>>(() => ({
            filters: {
                approvalStatus: segment.value === 'pending' ?
                    null :
                    segment.value as AnalysisNodeApprovalStatus,
            },
            relations: {
                node: true,
                analysis: true,
            },
            sort: { updatedAt: 'DESC' },
        }));

        const download = (item: AnalysisNode) => {
            if (typeof window !== 'undefined') {
                window.open(api.analysis.getFileDownloadURL(item.analysisId), '_blank');
            }
        };

        const listNode = useTemplateRef<typeof FAnalysisNodes>('listNode');

        // flush: 'post' — the list re-reads its `query` prop inside load(),
        // and with the default pre-render flush the new segment filter has
        // not been pushed into the child yet, so it reloads with the STALE
        // filter of the previous segment.
        watch(segment, () => {
            if (listNode.value) {
                listNode.value.load({ pagination: { offset: 0 } });
            }
        }, { flush: 'post' });

        const handleUpdated = (item: AnalysisNode) => {
            if (listNode.value) {
                listNode.value.handleUpdated(item);
            }
        };

        return {
            realmId,
            canManage,
            segment,
            segments,
            query,
            download,
            handleUpdated,
            listNode,
        };
    },
});
</script>
<template>
    <div>
        <div class="m-t-10 entity-cards">
            <FAnalysisNodes
                ref="listNode"
                :target="'analysis'"
                :realm-id="realmId"
                :direction="'in'"
                :query="query"
            >
                <template #header="props">
                    <ListTitle />
                    <ListSearch
                        :load="props.load"
                        :meta="props.meta"
                    />
                    <div class="mb-3 mt-1">
                        <FSegments
                            v-model="segment"
                            :items="segments"
                        />
                    </div>
                </template>
                <template #loading>
                    <FAnalysisNodeInCardSkeleton
                        v-for="index in 3"
                        :key="index"
                    />
                </template>
                <template #footer="props">
                    <ListPagination
                        :load="props.load"
                        :meta="props.meta"
                    />
                </template>
                <template #item="props">
                    <FAnalysisNodeInCard
                        :key="props.data.id"
                        :entity="props.data"
                        @updated="props.updated"
                    />
                </template>
            </FAnalysisNodes>
        </div>
    </div>
</template>
