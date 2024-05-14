<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { useAbilityCheck, useStore } from '@authup/client-web-kit';
import { VCTimeago } from '@vuecs/timeago';
import type { ProjectNode } from '@privateaim/core';
import {
    PermissionID,
} from '@privateaim/core';
import {
    BDropdown, BDropdownDivider, BDropdownItem, BModal, BSpinner, BTable,
} from 'bootstrap-vue-next';
import { storeToRefs } from 'pinia';
import type { Ref } from 'vue';
import { ref } from 'vue';
import {
    FPagination,
    FProjectInForm,
    FProjectNodeApprovalCommand,
    FProjectNodeApprovalStatus,
    FProjectNodes,
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
        BDropdown,
        BModal,
        BDropdownDivider,
        BDropdownItem,
        BSpinner,
        BTable,
        FProjectNodes,
        FProjectNodeApprovalCommand,
        FProjectNodeApprovalStatus,
        FProjectInForm,
        VCTimeago,
    },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.PROJECT_APPROVE,
            ],
        });

        const fields = [
            {
                key: 'project_id', label: 'Id', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'project_name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'approval_status', label: 'Status', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left',
            },
            { key: 'options', label: '', tdClass: 'text-left' },
        ];

        const api = injectCoreHTTPClient();
        const store = useStore();
        const { realmId } = storeToRefs(store);

        const canManage = useAbilityCheck(PermissionID.PROJECT_APPROVE);

        const nodeId : Ref<string | null> = ref(null);

        try {
            const response = await api.node.getMany({
                filter: {
                    realm_id: realmId.value,
                },
            });

            const node = response.data.pop();
            if (node) {
                nodeId.value = node.id;
            }
        } catch (e) {
            // do nothing :)
        }

        const modalNode = ref<boolean>(false);

        const entity = ref<null | ProjectNode>(null);

        const edit = (item: ProjectNode) => {
            entity.value = item;

            modalNode.value = true;
        };

        const listNode = ref<null | typeof FProjectNodes>(null);

        const handleUpdated = (item: ProjectNode) => {
            if (listNode.value) {
                listNode.value.handleUpdated(item);
            }

            modalNode.value = false;
        };

        const handleFailed = () => {
            // todo: handle error
        };

        return {
            realmId,
            nodeId,
            entity,
            handleFailed,
            handleUpdated,
            canManage,
            edit,
            fields,
            listNode,
            modalNode,
        };
    },
});
</script>
<template>
    <div>
        <div class="m-t-10">
            <FProjectNodes
                ref="listNode"
                :direction="'in'"
                :target="'project'"
                :realm-id="realmId"
                :source-id="nodeId"
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
                        <template #cell(realm)="data">
                            <span class="bg-dark badge">{{ data.item.project_realm_id }}</span>
                        </template>

                        <template #cell(approval_status)="data">
                            <FProjectNodeApprovalStatus
                                :status="data.item.approval_status"
                            >
                                <template #default="slotProps">
                                    <span
                                        class="badge"
                                        :class="'bg-'+slotProps.classSuffix"
                                    >
                                        {{ slotProps.statusText }}
                                    </span>
                                </template>
                            </FProjectNodeApprovalStatus>
                        </template>

                        <template #cell(project_id)="data">
                            {{ data.item.project.id }}
                        </template>
                        <template #cell(project_name)="data">
                            {{ data.item.project.name }}
                        </template>
                        <template #cell(options)="data">
                            <NuxtLink
                                class="btn btn-primary btn-xs me-1"
                                :to="'/projects/'+data.item.project_id+'?refPath=/projects/in'"
                            >
                                <i class="fa fa-arrow-right" />
                            </NuxtLink>
                            <template v-if="canManage">
                                <b-dropdown
                                    class="dropdown-xs"
                                    :no-caret="true"
                                >
                                    <template #button-content>
                                        <i class="fa fa-bars" />
                                    </template>
                                    <b-dropdown-item @click.prevent="edit(data.item)">
                                        <i class="fa fa-comment-alt ps-1 pe-1" /> comment
                                    </b-dropdown-item>
                                    <b-dropdown-divider />
                                    <FProjectNodeApprovalCommand
                                        :entity-id="data.item.id"
                                        :approval-status="data.item.approval_status"
                                        :with-icon="true"
                                        :element-type="'dropDownItem'"
                                        :command="'approve'"
                                        @updated="props.updated"
                                    />
                                    <FProjectNodeApprovalCommand
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
                        <template #cell(created_at)="data">
                            <VCTimeago :datetime="data.item.created_at" />
                        </template>
                        <template #cell(updated_at)="data">
                            <VCTimeago :datetime="data.item.updated_at" />
                        </template>
                        <template #table-busy>
                            <div class="text-center text-danger my-2">
                                <b-spinner class="align-middle" />
                                <strong>Loading...</strong>
                            </div>
                        </template>
                    </BTable>
                </template>
            </FProjectNodes>
        </div>

        <BModal
            v-model="modalNode"
            size="lg"
            button-size="sm"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <template #title>
                <i class="fas fa-file-import" /> Project {{ entity ? entity.project.name : '' }}
            </template>
            <template v-if="entity">
                <FProjectInForm
                    :entity="entity"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
            </template>
            <template v-else>
                ...
            </template>
        </BModal>
    </div>
</template>
