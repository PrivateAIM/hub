<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs, usePermissionCheck } from '@authup/client-web-kit';
import { PermissionName } from '@privateaim/kit';
import { VCTimeago } from '@vuecs/timeago';
import type { TableColumn } from '@vuecs/table';
import type { Node } from '@privateaim/core-kit';
import type { BuildInput } from 'rapiq';
import { computed, defineComponent } from 'vue';
import {
    FEntityDelete,
    FEventActor,
    FEventExpiring,
    FEvents,
    FPagination,
    FSearch,
    FTitle,
} from '@privateaim/client-vue';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineComponent({
    components: {
        FEventActor,
        FEventExpiring,
        FPagination,
        FSearch,
        FTitle,
        FEntityDelete,
        FEvents,
        VCTimeago,
    },
    emits: ['deleted'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });

        const columns: TableColumn[] = [
            {
                key: 'name',
                label: 'Name',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
            {
                key: 'scope',
                label: 'Scope',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
            {
                key: 'ref_type',
                label: 'Ref Type',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
            {
                key: 'ref_id',
                label: 'Ref ID',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
            {
                key: 'actor',
                label: 'Actor',
                headerClass: 'text-center',
                cellClass: 'text-center',
            },
            {
                key: 'expiring',
                label: 'Expiring?',
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

        const store = injectStore();
        const { realmManagementId } = storeToRefs(store);

        const canEdit = usePermissionCheck({ name: PermissionName.NODE_UPDATE });
        const canDrop = usePermissionCheck({ name: PermissionName.NODE_DELETE });
        const canView = computed(() => canEdit.value || canDrop.value);

        const query = computed<BuildInput<Node>>(() => ({
            filters: { realm_id: [realmManagementId.value, null] },
            sort: { updated_at: 'DESC' },
            pagination: { limit: 50 },
        }));

        const handleDeleted = async (item: Node) => {
            emit('deleted', item);
        };

        return {
            columns,
            realmManagementId,
            canView,
            canDrop,
            query,
            handleDeleted,
        };
    },
});
</script>
<template>
    <FEvents
        :query="query"
        :load-on-init="true"
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
                :total="props.meta.pagination?.total"
                :load="props.load"
                :meta="props.meta"
            />
        </template>
        <template #body="props">
            <VCTable
                :data="props.data"
                :columns="columns"
                :busy="props.busy"
                bordered
            >
                <template #cell-scoppe="{ row }: { row: any }">
                    <template v-if="row.scope">
                        {{ row.scope }}
                    </template>
                    <template v-else>
                        -
                    </template>
                </template>
                <template #cell-actor="{ row }: { row: any }">
                    <FEventActor :entity="row" />
                </template>
                <template #cell-expiring="{ row }: { row: any }">
                    <FEventExpiring
                        :entity="row"
                        :direction="'row'"
                    />
                </template>
                <template #cell-options="{ row }: { row: any }">
                    <nuxt-link
                        v-if="canView"
                        class="btn btn-xs btn-outline-primary"
                        :to="'/admin/events/'+row.id"
                    >
                        <i class="fa fa-share-square" />
                    </nuxt-link>
                    <FEntityDelete
                        v-if="canDrop"
                        service="telemetry"
                        class="btn btn-xs btn-outline-danger ms-1"
                        :entity-id="row.id"
                        :entity-type="'event'"
                        :with-text="false"
                        @deleted="props.deleted"
                    />
                </template>
                <template #cell-created_at="{ row }: { row: any }">
                    <VCTimeago :datetime="row.created_at" />
                </template>
                <template #cell-updated_at="{ row }: { row: any }">
                    <VCTimeago :datetime="row.updated_at" />
                </template>
            </VCTable>
        </template>
    </FEvents>
</template>
