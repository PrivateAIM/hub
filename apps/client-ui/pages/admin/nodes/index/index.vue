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
import type { Node } from '@privateaim/core-kit';
import type { BuildInput } from 'rapiq';
import { computed, resolveComponent } from 'vue';
import {
    FEntityDelete,
    FNodes,
    FPagination,
    FSearch,
    FTitle,
} from '@privateaim/client-vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineNuxtComponent({
    components: {
        ListPagination: FPagination,
        ListSearch: FSearch,
        ListTitle: FTitle,
        EntityDelete: FEntityDelete,
        FNodes,
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

        const columns: TableColumn<Node>[] = [
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

        const store = injectStore();
        const { realmManagementId } = storeToRefs(store);

        const canEdit = usePermissionCheck({ name: PermissionName.NODE_UPDATE });
        const canDrop = usePermissionCheck({ name: PermissionName.NODE_DELETE });
        const canView = computed(() => canEdit.value || canDrop.value);

        const query = computed<BuildInput<Node>>(() => ({
            filters: { realm_id: realmManagementId.value },
            sort: { updated_at: 'DESC' },
        }));

        const handleDeleted = async (item: Node) => {
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
    <FNodes
        :query="query"
        :load-on-init="true"
        @deleted="handleDeleted"
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
            <VCTable
                :data="props.data"
                :columns="columns"
                :busy="props.busy"
            >
                <template #cell-options="{ row }">
                    <div class="flex items-center">
                        <VCButton
                            v-if="canView"
                            :as="NuxtLink"
                            size="xs"
                            color="primary"
                            variant="outline"
                            :to="'/admin/nodes/'+row.id"
                        >
                            <VCIcon name="fa6-solid:bars" />
                        </VCButton>
                        <EntityDelete
                            v-if="canDrop"
                            size="sm"
                            class="ms-1"
                            :entity-id="row.id"
                            :entity-type="'node'"
                            :with-text="false"
                            @deleted="props.deleted"
                        />
                    </div>
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
    </FNodes>
</template>
