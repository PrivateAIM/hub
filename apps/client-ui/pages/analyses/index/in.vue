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
import type { QueryBuildInput } from '@rapiq/core';
import { useTemplateRef } from 'vue';
import {
    FAnalysisNodeInCard,
    FAnalysisNodes,
    FPagination,
    FSearch,
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
        FAnalysisNodes,
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

        const query : QueryBuildInput<AnalysisNode, 3> = {
            relations: {
                node: true,
                analysis: true,
            },
            sort: { updatedAt: 'DESC' },
        };

        const download = (item: AnalysisNode) => {
            if (typeof window !== 'undefined') {
                window.open(api.analysis.getFileDownloadURL(item.analysisId), '_blank');
            }
        };

        const listNode = useTemplateRef<typeof FAnalysisNodes>('listNode');

        const handleUpdated = (item: AnalysisNode) => {
            if (listNode.value) {
                listNode.value.handleUpdated(item);
            }
        };

        return {
            realmId,
            canManage,
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
        <div class="m-t-10">
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
