<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { usePermissionCheck, injectStore } from '@authup/client-web-kit';
import { PermissionName } from '@privateaim/kit';
import { VCTimeago } from '@vuecs/timeago';
import type { AnalysisNode } from '@privateaim/core-kit';
import { BDropdown, BTable } from 'bootstrap-vue-next';
import { storeToRefs } from 'pinia';
import type { BuildInput } from 'rapiq';
import { ref } from 'vue';
import {
    FAnalysisNodeInCard,
    FAnalysisNodes,
    FPagination,
    FSearch,
    FTitle, injectCoreHTTPClient,
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
        BDropdown,
        BTable,
        FAnalysisNodes,
        VCTimeago,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.ANALYSIS_APPROVE,
            ],
        });

        const fields = [
            {
                key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'approval_status', label: 'Approval Status', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'run_status', label: 'Run Status', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'updated_at', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'created_at', label: 'Created At', thClass: 'text-left', tdClass: 'text-left',
            },
            { key: 'options', label: '', tdClass: 'text-left' },
        ];

        const api = injectCoreHTTPClient();
        const store = injectStore();
        const { realmId } = storeToRefs(store);

        const canManage = usePermissionCheck({ name: PermissionName.ANALYSIS_APPROVE });

        const query : BuildInput<AnalysisNode> = {
            include: {
                node: true,
                analysis: true,
            },
            sort: {
                updated_at: 'DESC',
            },
        };

        const download = (item: AnalysisNode) => {
            window.open(api.analysis.getFileDownloadURL(item.analysis_id), '_blank');
        };

        const listNode = ref<null | typeof FAnalysisNodes>(null);

        const handleUpdated = (item: AnalysisNode) => {
            if (listNode.value) {
                listNode.value.handleUpdated(item);
            }
        };

        return {
            fields,
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
                :ref="listNode"
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
