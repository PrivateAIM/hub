<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { useAbilityCheck, useStore } from '@authup/client-web-kit';
import { VCTimeago } from '@vuecs/timeago';
import type { Node } from '@privateaim/core';
import { PermissionID } from '@privateaim/core';
import { BTable } from 'bootstrap-vue-next';
import { storeToRefs } from 'pinia';
import type { BuildInput } from 'rapiq';
import { computed } from 'vue';
import {
    EntityDelete, FNodes, FPagination, FSearch, FTitle,
} from '@privateaim/client-vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineNuxtComponent({
    components: {
        ListPagination: FPagination,
        ListSearch: FSearch,
        ListTitle: FTitle,
        EntityDelete,
        BTable,
        FNodes,
        VCTimeago,
    },
    emits: ['deleted'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });

        const fields = [
            {
                key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'options', label: '', tdClass: 'text-left',
            },
        ];

        const store = useStore();
        const { realmManagementId } = storeToRefs(store);

        const canEdit = useAbilityCheck(PermissionID.NODE_EDIT);
        const canDrop = useAbilityCheck(PermissionID.NODE_DROP);
        const canView = computed(() => canEdit.value || canDrop.value);

        const query = computed<BuildInput<Node>>(() => ({
            filters: {
                realm_id: realmManagementId.value,
            },
        }));

        const handleDeleted = async (item: Node) => {
            emit('deleted', item);
        };

        return {
            fields,
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
            <BTable
                :items="props.data"
                :fields="fields"
                :busy="props.busy"
                head-variant="'dark'"
                outlined
            >
                <template #cell(options)="data">
                    <nuxt-link
                        v-if="canView"
                        class="btn btn-xs btn-outline-primary"
                        :to="'/admin/nodes/'+data.item.id"
                    >
                        <i class="fa fa-bars" />
                    </nuxt-link>
                    <EntityDelete
                        v-if="canDrop"
                        class="btn btn-xs btn-outline-danger ms-1"
                        :entity-id="data.item.id"
                        :entity-type="'node'"
                        :with-text="false"
                        @deleted="props.deleted"
                    />
                </template>
                <template #cell(created_at)="data">
                    <VCTimeago :datetime="data.item.created_at" />
                </template>
                <template #cell(updated_at)="data">
                    <VCTimeago :datetime="data.item.updated_at" />
                </template>
            </BTable>
        </template>
    </FNodes>
</template>
