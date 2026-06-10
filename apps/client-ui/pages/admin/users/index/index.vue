<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { TableColumn } from '@vuecs/table';
import type { User } from '@authup/core-kit';
import {
    PermissionName,
} from '@authup/core-kit';
import {
    AEntityDelete,
    AUsers,
    injectStore,
    storeToRefs,
    usePermissionCheck,
} from '@authup/client-web-kit';
import type { BuildInput } from 'rapiq';
import { FPagination, FSearch, FTitle } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: {
        FPagination,
        FSearch,
        FTitle,
        AUsers,
        AEntityDelete,
    },
    emits: ['deleted'],
    setup(props, { emit }) {
        const handleDeleted = (e: User) => {
            emit('deleted', e);
        };

        const store = injectStore();
        const { realmManagementId } = storeToRefs(store);

        const query : BuildInput<User> = { filter: { realm_id: [realmManagementId.value, null] } };

        const hasEditPermission = usePermissionCheck({ name: PermissionName.USER_UPDATE });
        const hasDropPermission = usePermissionCheck({ name: PermissionName.USER_DELETE });

        const columns: TableColumn[] = [
            {
                key: 'name',
                label: 'Name',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
            {
                key: 'created_at',
                label: 'Created At',
                headerClass: 'text-center',
                cellClass: 'text-center',
            },
            {
                key: 'updated_at',
                label: 'Updated At',
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
        };
    },
});
</script>
<template>
    <AUsers
        :query="query"
        @deleted="handleDeleted"
    >
        <template #header="props">
            <FTitle />
            <FSearch
                :load="props.load"
                :meta="props.meta"
            />
        </template>
        <template #footer="props">
            <FPagination
                :load="props.load"
                :meta="props.meta"
            />
        </template>
        <template #body="props">
            <VCTable
                :data="props.data"
                :columns="columns"
                :busy="props.busy"
            >
                <template #cell-created_at="{ row }: { row: any }">
                    <VCTimeago :datetime="row.created_at" />
                </template>
                <template #cell-updated_at="{ row }: { row: any }">
                    <VCTimeago :datetime="row.updated_at" />
                </template>
                <template #cell-options="{ row }: { row: any }">
                    <NuxtLink
                        :to="'/admin/users/'+ row.id"
                        class="btn btn-xs btn-outline-primary me-1"
                        :disabled="!hasEditPermission"
                    >
                        <VCIcon name="fa6-solid:bars" />
                    </NuxtLink>
                    <AEntityDelete
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="row.id"
                        entity-type="user"
                        :with-text="false"
                        :disabled="!hasDropPermission"
                        @deleted="props.deleted"
                    />
                </template>
                <VCTableLoading />
                <VCTableEmpty />
            </VCTable>
        </template>
    </AUsers>
</template>
