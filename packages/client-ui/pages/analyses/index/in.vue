<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { useAbilityCheck, useStore } from '@authup/client-web-kit';
import { VCTimeago } from '@vuecs/timeago';
import type { AnalysisNode } from '@privateaim/core';
import { PermissionID } from '@privateaim/core';
import { BDropdown, BTable } from 'bootstrap-vue-next';
import { storeToRefs } from 'pinia';
import type { BuildInput } from 'rapiq';
import { computed, ref } from 'vue';
import {
    FAnalysisName,
    FAnalysisNodeApprovalCommand,
    FAnalysisNodeApprovalStatus,
    FAnalysisNodeRunStatus,
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
        FAnalysisName,
        BDropdown,
        BTable,
        FAnalysisNodeRunStatus,
        FAnalysisNodeApprovalCommand,
        FAnalysisNodeApprovalStatus,
        FAnalysisNodes,
        VCTimeago,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.ANALYSIS_APPROVE,
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
        const store = useStore();
        const { realmId } = storeToRefs(store);

        const canManage = computed(() => useAbilityCheck(PermissionID.ANALYSIS_APPROVE));

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
                <template #body="props">
                    <BTable
                        :items="props.data"
                        :fields="fields"
                        :busy="props.busy"
                        head-variant="'dark'"
                        outlined
                    >
                        <template #cell(id)="data">
                            <template v-if="data.item.analysis">
                                <FAnalysisName
                                    :entity-id="data.item.analysis.id"
                                    :entity-name="data.item.analysis.name"
                                />
                            </template>
                            <template v-else>
                                {{ data.item.analysis_id }}
                            </template>
                        </template>
                        <template #cell(realm)="data">
                            <span class="bg-dark badge">{{ data.item.analysis_realm_id }}</span>
                        </template>
                        <template #cell(approval_status)="data">
                            <FAnalysisNodeApprovalStatus :status="data.item.approval_status">
                                <template #default="statusProps">
                                    <span
                                        class="badge"
                                        :class="'bg-'+statusProps.classSuffix"
                                    >{{ statusProps.statusText }}</span>
                                </template>
                            </FAnalysisNodeApprovalStatus>
                        </template>
                        <template #cell(run_status)="data">
                            <FAnalysisNodeRunStatus :status="data.item.run_status">
                                <template #default="statusProps">
                                    <span
                                        class="badge"
                                        :class="'bg-'+statusProps.classSuffix"
                                    >{{ statusProps.statusText }}</span>
                                </template>
                            </FAnalysisNodeRunStatus>
                        </template>
                        <template #cell(created_at)="data">
                            <VCTimeago :datetime="data.item.created_at" />
                        </template>
                        <template #cell(updated_at)="data">
                            <VCTimeago :datetime="data.item.updated_at" />
                        </template>

                        <template #cell(options)="data">
                            <button
                                type="button"
                                class="btn btn-dark btn-xs me-1"
                                @click.prevent="download(data.item)"
                            >
                                <i class="fa fa-file-download" />
                            </button>
                            <template v-if="canManage">
                                <b-dropdown
                                    class="dropdown-xs"
                                    :no-caret="true"
                                >
                                    <template #button-content>
                                        <i class="fa fa-bars" />
                                    </template>
                                    <FAnalysisNodeApprovalCommand
                                        :entity-id="data.item.id"
                                        :approval-status="data.item.approval_status"
                                        :with-icon="true"
                                        :element-type="'dropDownItem'"
                                        :command="'approve'"
                                        @updated="props.updated"
                                    />
                                    <FAnalysisNodeApprovalCommand
                                        :entity-id="data.item.id"
                                        :approval-status="data.item.approval_status"
                                        :with-icon="true"
                                        :element-type="'dropDownItem'"
                                        :command="'reject'"
                                        @updated="props.updated"
                                    />
                                </b-dropdown>
                            </template>
                        </template>

                        <template #table-busy>
                            <div class="text-center text-danger my-2">
                                <b-spinner class="align-middle" />
                                <strong>Loading...</strong>
                            </div>
                        </template>
                    </BTable>
                </template>
            </FAnalysisNodes>
        </div>
    </div>
</template>
