<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { VCTimeago } from '@vuecs/timeago';
import type { TableColumn } from '@vuecs/table';
import { REALM_MASTER_NAME, type Realm } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import {
    AEntityDelete,
    APagination,
    ARealms,
    ASearch,
    ATitle,
    injectStore,
    storeToRefs,
    usePermissionCheck,
} from '@authup/client-web-kit';
import { computed } from 'vue';
import { defineNuxtComponent } from '#imports';

export default defineNuxtComponent({
    components: {
        ATitle,
        APagination,
        ASearch,
        AEntityDelete,
        ARealms,
        VCTimeago,
    },
    emits: ['deleted'],
    setup(props, { emit }) {
        const store = injectStore();
        const {
            realm,
            realmManagementId,
        } = storeToRefs(store);

        const handleDeleted = (e: Realm) => {
            emit('deleted', e);
        };

        const hasEditPermission = usePermissionCheck({ name: PermissionName.REALM_UPDATE });
        const hasDropPermission = usePermissionCheck({ name: PermissionName.REALM_DELETE });

        const isMaster = computed(() => realm.value && realm.value.name === REALM_MASTER_NAME);

        const columns: TableColumn[] = [
            {
                key: 'name',
                label: 'Name',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
            {
                key: 'updated_at',
                label: 'Updated At',
                headerClass: 'text-center',
                cellClass: 'text-center',
            },
            {
                key: 'created_at',
                label: 'Created At',
                headerClass: 'text-center',
                cellClass: 'text-center',
            },
            {
                key: 'options',
                label: '',
                cellClass: 'text-left',
            },
        ];

        return {
            isMaster,
            columns,
            hasEditPermission,
            hasDropPermission,
            handleDeleted,
            realmManagementId,
            setRealmManagement: store.setRealmManagement,
        };
    },
});
</script>
<template>
    <ARealms
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
                <template #cell-created_at="{ row }: { row: any }">
                    <VCTimeago :datetime="row.created_at" />
                </template>
                <template #cell-updated_at="{ row }: { row: any }">
                    <VCTimeago :datetime="row.updated_at" />
                </template>
                <template #cell-options="{ row }: { row: any }">
                    <template v-if="isMaster">
                        <button
                            v-if="realmManagementId !== row.id"
                            class="btn btn-xs btn-primary me-1"
                            @click.prevent="setRealmManagement(row)"
                        >
                            <VCIcon name="fa6-solid:check" />
                        </button>
                    </template>
                    <NuxtLink
                        :to="'/admin/realms/'+ row.id"
                        class="btn btn-xs btn-outline-primary me-1"
                        :disabled="!hasEditPermission"
                    >
                        <VCIcon name="fa6-solid:bars" />
                    </NuxtLink>
                    <AEntityDelete
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="row.id"
                        entity-type="realm"
                        :with-text="false"
                        :disabled="!row.built_in || !hasDropPermission"
                        @deleted="props.deleted"
                    />
                </template>
                <VCTableLoading />
                <VCTableEmpty />
            </VCTable>
        </template>
    </ARealms>
</template>
