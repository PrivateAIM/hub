<script lang="ts">

import type { TableColumn } from '@vuecs/table';
import {
    AClients,
    AEntityDelete,
    APagination,
    ASearch,
    ATitle,
    AUser,
    injectStore,
    storeToRefs,
    usePermissionCheck,
} from '@authup/client-web-kit';
import type { Client } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { FDisplayName } from '@privateaim/client-vue';
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';

import type { BuildInput } from 'rapiq';
import { defineComponent, resolveComponent } from 'vue';

export default defineComponent({
    components: {
        APagination,
        ASearch,
        ATitle,
        AEntityDelete,
        AClients,
        AUser,
        FDisplayName,
        VCButton,
        VCIcon,
    },
    emits: ['deleted'],
    setup(props, { emit }) {
        const NuxtLink = resolveComponent('NuxtLink');

        const handleDeleted = (e: Client) => {
            emit('deleted', e);
        };

        const store = injectStore();
        const { realmManagementId } = storeToRefs(store);

        const query : BuildInput<Client> = { filters: { realm_id: [realmManagementId.value, null] } };

        const hasEditPermission = usePermissionCheck({ name: PermissionName.CLIENT_UPDATE });
        const hasDropPermission = usePermissionCheck({ name: PermissionName.CLIENT_DELETE });

        const columns: TableColumn[] = [
            {
                key: 'name',
                label: 'Name',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
            {
                key: 'active',
                label: 'Active?',
                headerClass: 'text-center',
                cellClass: 'text-center',
            },
            {
                key: 'is_confidential',
                label: 'Confidential?',
                headerClass: 'text-center',
                cellClass: 'text-center',
            },
            {
                key: 'built_in',
                label: 'Built in?',
                headerClass: 'text-center',
                cellClass: 'text-center',
            },
            {
                key: 'created_at',
                label: 'Created at',
                headerClass: 'text-center',
                cellClass: 'text-center',
            },
            {
                key: 'updated_at',
                label: 'Updated at',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
            {
                key: 'options',
                label: '',
                cellClass: 'text-left',
            },
        ];

        return {
            columns,
            hasEditPermission,
            hasDropPermission,
            handleDeleted,
            query,
            NuxtLink,
        };
    },
});
</script>
<template>
    <AClients
        :query="query"
        @deleted="handleDeleted"
    >
        <template #header="props">
            <ATitle />
            <ASearch
                :load="props.load"
                :busy="props.busy"
            />
        </template>
        <template #footer="props">
            <APagination
                :busy="props.busy"
                :meta="props.meta"
                :load="props.load"
            />
        </template>
        <template #body="props">
            <VCTable
                :data="props.data"
                :columns="columns"
                :busy="props.busy"
            >
                <template #cell-name="{ row }: { row: any }">
                    <FDisplayName
                        :name="row.name"
                        :display-name="row.display_name"
                    />
                </template>
                <template #cell-active="{ row }: { row: any }">
                    <VCIcon
                        :name="row.active ? 'fa6-solid:check' : 'fa6-solid:xmark'"
                        :class="row.active ? 'text-success-600' : 'text-error-600'"
                    />
                </template>
                <template #cell-is_confidential="{ row }: { row: any }">
                    <VCIcon
                        :name="row.is_confidential ? 'fa6-solid:check' : 'fa6-solid:xmark'"
                        :class="row.is_confidential ? 'text-success-600' : 'text-error-600'"
                    />
                </template>
                <template #cell-built_in="{ row }: { row: any }">
                    <VCIcon
                        :name="row.built_in ? 'fa6-solid:check' : 'fa6-solid:xmark'"
                        :class="row.built_in ? 'text-success-600' : 'text-error-600'"
                    />
                </template>
                <template #cell-created_at="{ row }: { row: any }">
                    <VCTimeago :datetime="row.created_at" />
                </template>
                <template #cell-updated_at="{ row }: { row: any }">
                    <VCTimeago :datetime="row.updated_at" />
                </template>
                <template #cell-user_id="{ row }: { row: any }">
                    <template v-if="row.user_id">
                        <AUser :entity-id="row.user_id">
                            <template #default="user">
                                <FDisplayName
                                    :name="user.data.name"
                                    :display-name="user.data.display_name"
                                />
                            </template>
                            <template #error>
                                -
                            </template>
                        </AUser>
                    </template>
                    <template v-else>
                        -
                    </template>
                </template>
                <template #cell-options="{ row }: { row: any }">
                    <VCButton
                        :as="NuxtLink"
                        :to="'/admin/clients/'+ row.id"
                        size="xs"
                        color="primary"
                        variant="outline"
                        class="me-1"
                        :disabled="!hasEditPermission"
                    >
                        <VCIcon name="fa6-solid:bars" />
                    </VCButton>
                    <AEntityDelete
                        size="xs"
                        :entity-id="row.id"
                        entity-type="client"
                        :with-text="false"
                        :disabled="!hasDropPermission"
                        @deleted="props.deleted"
                    />
                </template>
                <VCTableLoading />
                <VCTableEmpty />
            </VCTable>
        </template>
    </AClients>
</template>
