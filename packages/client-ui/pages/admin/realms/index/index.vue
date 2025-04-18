<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { VCTimeago } from '@vuecs/timeago';
import { BTable } from 'bootstrap-vue-next';
import { REALM_MASTER_NAME, type Realm } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import {
    AEntityDelete, APagination, ARealms, ASearch, ATitle, injectStore, storeToRefs,
    usePermissionCheck,
} from '@authup/client-web-kit';
import { computed } from 'vue';
import { defineNuxtComponent } from '#imports';

export default defineNuxtComponent({
    components: {
        ATitle,
        APagination,
        ASearch,
        BTable,
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

        const fields = [
            {
                key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'updated_at', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
            },
            { key: 'options', label: '', tdClass: 'text-left' },
        ];

        return {
            isMaster,
            fields,
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
            <BTable
                :items="props.data"
                :fields="fields"
                :busy="props.busy"
                head-variant="'dark'"
                outlined
            >
                <template #cell(created_at)="data">
                    <VCTimeago :datetime="data.item.created_at" />
                </template>
                <template #cell(updated_at)="data">
                    <VCTimeago :datetime="data.item.created_at" />
                </template>
                <template #cell(options)="data">
                    <template v-if="isMaster">
                        <button
                            v-if="realmManagementId !== data.item.id"
                            class="btn btn-xs btn-primary me-1"
                            @click.prevent="setRealmManagement(data.item)"
                        >
                            <i class="fa-solid fa-check" />
                        </button>
                    </template>
                    <NuxtLink
                        :to="'/admin/realms/'+ data.item.id"
                        class="btn btn-xs btn-outline-primary me-1"
                        :disabled="!hasEditPermission"
                    >
                        <i class="fa-solid fa-bars" />
                    </NuxtLink>
                    <AEntityDelete
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="data.item.id"
                        entity-type="realm"
                        :with-text="false"
                        :disabled="!data.item.built_in || !hasDropPermission"
                        @deleted="props.deleted"
                    />
                </template>
            </BTable>
        </template>
    </ARealms>
</template>
