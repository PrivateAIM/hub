<script lang="ts">

import type { TableColumn } from '@vuecs/table';
import {
    AClients,
    AEntityDelete,
    APagination,
    ASearch,
    ATitle,
    injectStore,
    storeToRefs,
    usePermissionCheck,
} from '@authup/client-web-kit';
import type { Client } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { FDisplayName } from '@privateaim/client-vue';
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';

import type { QueryBuildInput } from '@rapiq/core';
import { defineComponent, resolveComponent } from 'vue';

export default defineComponent({
    components: {
        APagination,
        ASearch,
        ATitle,
        AEntityDelete,
        AClients,
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

        const query : QueryBuildInput<Client> = { filters: { realmId: [realmManagementId.value, null] } };

        const hasEditPermission = usePermissionCheck({ name: PermissionName.CLIENT_UPDATE });
        const hasDropPermission = usePermissionCheck({ name: PermissionName.CLIENT_DELETE });

        const columns: TableColumn<Client>[] = [
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
                key: 'builtIn',
                label: 'Built in?',
                headerClass: 'text-center',
                cellClass: 'text-center',
            },
            {
                key: 'createdAt',
                label: 'Created at',
                headerClass: 'text-center',
                cellClass: 'text-center',
            },
            {
                key: 'updatedAt',
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
                <template #cell-name="{ row }">
                    <FDisplayName
                        :name="row.name"
                        :display-name="row.displayName"
                    />
                </template>
                <template #cell-active="{ row }">
                    <VCIcon
                        :name="row.active ? 'fa6-solid:check' : 'fa6-solid:xmark'"
                        :class="row.active ? 'text-success-600' : 'text-error-600'"
                    />
                </template>
                <template #cell-is_confidential="{ row }">
                    <VCIcon
                        :name="row.is_confidential ? 'fa6-solid:check' : 'fa6-solid:xmark'"
                        :class="row.is_confidential ? 'text-success-600' : 'text-error-600'"
                    />
                </template>
                <template #cell-builtIn="{ row }">
                    <VCIcon
                        :name="row.builtIn ? 'fa6-solid:check' : 'fa6-solid:xmark'"
                        :class="row.builtIn ? 'text-success-600' : 'text-error-600'"
                    />
                </template>
                <template #cell-createdAt="{ row }">
                    <VCTimeago :datetime="row.createdAt" />
                </template>
                <template #cell-updatedAt="{ row }">
                    <VCTimeago :datetime="row.updatedAt" />
                </template>
                <template #cell-options="{ row }">
                    <div class="flex items-center">
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
                            size="sm"
                            :entity-id="row.id"
                            entity-type="client"
                            :with-text="false"
                            :disabled="!hasDropPermission"
                            @deleted="props.deleted"
                        />
                    </div>
                </template>
                <VCTableLoading />
                <VCTableEmpty />
            </VCTable>
        </template>
    </AClients>
</template>
