<script lang="ts">

import { defineComponent, resolveComponent } from 'vue';
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { VCTimeago } from '@vuecs/timeago';
import type { TableColumn } from '@vuecs/table';
import {
    AEntityDelete,
    APagination,
    APolicies,
    ASearch,
    ATitle,
    injectStore,
    storeToRefs,
    usePermissionCheck,
} from '@authup/client-web-kit';
import type { Policy } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { FDisplayName } from '@privateaim/client-vue';
import type { QueryBuildInput } from '@rapiq/core';

export default defineComponent({
    components: {
        FDisplayName,
        ATitle,
        APagination,
        ASearch,
        AEntityDelete,
        APolicies,
        VCButton,
        VCIcon,
        VCTimeago,
    },
    emits: ['deleted'],
    setup(props, { emit }) {
        const NuxtLink = resolveComponent('NuxtLink');

        const handleDeleted = (e: Policy) => {
            emit('deleted', e);
        };

        const store = injectStore();
        const { realmManagementId } = storeToRefs(store);

        const query : QueryBuildInput<Policy> = { filters: { realmId: [realmManagementId.value, null] } };

        const hasEditPermission = usePermissionCheck({ name: PermissionName.PERMISSION_UPDATE });
        const hasDropPermission = usePermissionCheck({ name: PermissionName.PERMISSION_DELETE });

        const columns: TableColumn<Policy>[] = [
            {
                key: 'name',
                label: 'Name',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
            {
                key: 'type',
                label: 'Type',
                headerClass: 'text-left',
                cellClass: 'text-left',
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
    <APolicies
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
                <template #cell-created_at="{ row }">
                    <VCTimeago :datetime="row.createdAt" />
                </template>
                <template #cell-updated_at="{ row }">
                    <VCTimeago :datetime="row.updatedAt" />
                </template>
                <template #cell-options="{ row }">
                    <div class="flex items-center">
                        <VCButton
                            :as="NuxtLink"
                            :to="'/admin/policies/'+ row.id"
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
                            entity-type="policy"
                            :with-text="false"
                            :disabled="row.builtIn || !hasDropPermission"
                            @deleted="props.deleted"
                        />
                    </div>
                </template>
                <VCTableLoading />
                <VCTableEmpty />
            </VCTable>
        </template>
    </APolicies>
</template>
