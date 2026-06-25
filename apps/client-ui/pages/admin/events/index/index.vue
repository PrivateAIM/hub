<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs, usePermissionCheck } from '@authup/client-web-kit';
import { PermissionName } from '@privateaim/kit';
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { VCTimeago } from '@vuecs/timeago';
import type { TableColumn } from '@vuecs/table';
import type { Event } from '@privateaim/telemetry-kit';
import type { BuildInput } from 'rapiq';
import { computed, defineComponent, resolveComponent } from 'vue';
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
        VCButton,
        VCIcon,
        VCTimeago,
    },
    emits: ['deleted'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });

        const columns: TableColumn<Event>[] = [
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

        const canView = usePermissionCheck({ name: PermissionName.EVENT_READ });
        const canDrop = usePermissionCheck({ name: PermissionName.EVENT_DELETE });

        const query = computed<BuildInput<Event>>(() => ({
            filters: { realm_id: [realmManagementId.value, null] },
            sort: { updated_at: 'DESC' },
            pagination: { limit: 50 },
        }));

        const handleDeleted = async (item: Event) => {
            emit('deleted', item);
        };

        const NuxtLink = resolveComponent('NuxtLink');

        return {
            columns,
            realmManagementId,
            canView,
            canDrop,
            query,
            handleDeleted,
            NuxtLink,
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
            >
                <template #cell-scope="{ row }">
                    <template v-if="row.scope">
                        {{ row.scope }}
                    </template>
                    <template v-else>
                        -
                    </template>
                </template>
                <template #cell-actor="{ row }">
                    <FEventActor :entity="row" />
                </template>
                <template #cell-expiring="{ row }">
                    <FEventExpiring
                        :entity="row"
                        :direction="'row'"
                    />
                </template>
                <template #cell-options="{ row }">
                    <VCButton
                        v-if="canView"
                        :as="NuxtLink"
                        size="xs"
                        color="primary"
                        variant="outline"
                        :to="'/admin/events/'+row.id"
                    >
                        <VCIcon name="fa6-solid:share-from-square" />
                    </VCButton>
                    <FEntityDelete
                        v-if="canDrop"
                        service="telemetry"
                        size="xs"
                        class="ms-1"
                        :entity-id="row.id"
                        :entity-type="'event'"
                        :with-text="false"
                        @deleted="props.deleted"
                    />
                </template>
                <template #cell-created_at="{ row }">
                    <VCTimeago :datetime="row.created_at" />
                </template>
                <template #cell-updated_at="{ row }">
                    <VCTimeago :datetime="row.updated_at" />
                </template>
                <VCTableLoading />
                <VCTableEmpty />
            </VCTable>
        </template>
    </FEvents>
</template>
