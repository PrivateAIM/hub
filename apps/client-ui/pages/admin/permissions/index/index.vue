<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { VCTimeago } from '@vuecs/timeago';
import type { TableColumn } from '@vuecs/table';
import {
    AEntityDelete,
    APagination,
    APermissions,
    ASearch,
    ATitle,
    injectStore,
    storeToRefs,
    usePermissionCheck,
} from '@authup/client-web-kit';
import type { Permission } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';

import type { BuildInput } from 'rapiq';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: {
        ATitle,
        APagination,
        ASearch,
        AEntityDelete,
        APermissions,
        VCTimeago,
    },
    emits: ['deleted'],
    setup(props, { emit }) {
        const handleDeleted = (e: Permission) => {
            emit('deleted', e);
        };

        const store = injectStore();
        const { realmManagementId } = storeToRefs(store);

        const query : BuildInput<Permission> = { filters: { realm_id: [realmManagementId.value, null] } };

        const hasEditPermission = usePermissionCheck({ name: PermissionName.PERMISSION_UPDATE });
        const hasDropPermission = usePermissionCheck({ name: PermissionName.PERMISSION_DELETE });

        const columns: TableColumn[] = [
            {
                key: 'name',
                label: 'Name',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
            {
                key: 'built_in',
                label: 'Built in?',
                headerClass: 'text-center',
                cellClass: 'text-center',
            },
            {
                key: 'global',
                label: 'Global?',
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
        };
    },
});
</script>
<template>
    <APermissions
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
                <template #cell-built_in="{ row }: { row: any }">
                    <VCIcon
                        :name="row.built_in ? 'fa6-solid:check' : 'fa6-solid:xmark'"
                        :class="row.built_in ? 'text-success-600' : 'text-error-600'"
                    />
                </template>
                <template #cell-global="{ row }: { row: any }">
                    <VCIcon
                        :name="!row.realm_id ? 'fa6-solid:check' : 'fa6-solid:xmark'"
                        :class="!row.realm_id ? 'text-success-600' : 'text-error-600'"
                    />
                </template>
                <template #cell-created_at="{ row }: { row: any }">
                    <VCTimeago :datetime="row.created_at" />
                </template>
                <template #cell-updated_at="{ row }: { row: any }">
                    <VCTimeago :datetime="row.updated_at" />
                </template>
                <template #cell-options="{ row }: { row: any }">
                    <NuxtLink
                        :to="'/admin/permissions/'+ row.id"
                        class="btn btn-xs btn-outline-primary me-1"
                        :disabled="!hasEditPermission"
                    >
                        <VCIcon name="fa6-solid:bars" />
                    </NuxtLink>
                    <AEntityDelete
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="row.id"
                        entity-type="permission"
                        :with-text="false"
                        :disabled="row.built_in || !hasDropPermission"
                        @deleted="(e) => props.deleted!(e)"
                    />
                </template>
                <VCTableLoading />
                <VCTableEmpty />
            </VCTable>
        </template>
    </APermissions>
</template>
