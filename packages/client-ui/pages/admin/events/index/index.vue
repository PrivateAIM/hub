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
import type { Node } from '@privateaim/core-kit';
import { BTable } from 'bootstrap-vue-next';
import type { BuildInput } from 'rapiq';
import { computed, defineComponent } from 'vue';
import {
    FEntityDelete, FEventActor, FEventExpiring, FEvents, FPagination, FSearch, FTitle,
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
        BTable,
        FEvents,
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
                key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'scope', label: 'Scope', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'ref_type', label: 'Ref Type', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'ref_id', label: 'Ref ID', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'actor', label: 'Actor', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'expiring', label: 'Expiring?', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'options', label: '', tdClass: 'text-left',
            },
        ];

        const store = injectStore();
        const { realmManagementId } = storeToRefs(store);

        const canEdit = usePermissionCheck({ name: PermissionName.NODE_UPDATE });
        const canDrop = usePermissionCheck({ name: PermissionName.NODE_DELETE });
        const canView = computed(() => canEdit.value || canDrop.value);

        const query = computed<BuildInput<Node>>(() => ({
            filters: {
                realm_id: [realmManagementId.value, null],
            },
            sort: {
                updated_at: 'DESC',
            },
            pagination: {
                limit: 50,
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
            <BTable
                :items="props.data"
                :fields="fields"
                :busy="props.busy"
                outlined
            >
                <template #cell(scoppe)="data">
                    <template v-if="data.item.scope">
                        {{ data.item.scope }}
                    </template>
                    <template v-else>
                        -
                    </template>
                </template>
                <template #cell(actor)="data">
                    <FEventActor :entity="data.item" />
                </template>
                <template #cell(expiring)="data">
                    <FEventExpiring
                        :entity="data.item"
                        :direction="'row'"
                    />
                </template>
                <template #cell(options)="data">
                    <nuxt-link
                        v-if="canView"
                        class="btn btn-xs btn-outline-primary"
                        :to="'/admin/events/'+data.item.id"
                    >
                        <i class="fa fa-share-square" />
                    </nuxt-link>
                    <FEntityDelete
                        v-if="canDrop"
                        service="telemetry"
                        class="btn btn-xs btn-outline-danger ms-1"
                        :entity-id="data.item.id"
                        :entity-type="'event'"
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
    </FEvents>
</template>
