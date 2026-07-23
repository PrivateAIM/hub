<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { VCTimeago } from '@vuecs/timeago';
import type { TableColumn } from '@vuecs/table';
import { REALM_MASTER_NAME, type Realm } from '@authup/core-kit';
import { FDisplayName } from '@privateaim/client-vue';
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
import { computed, resolveComponent } from 'vue';
import { defineNuxtComponent } from '#imports';

export default defineNuxtComponent({
    components: {
        FDisplayName,
        ATitle,
        APagination,
        ASearch,
        AEntityDelete,
        ARealms,
        VCButton,
        VCIcon,
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

        const NuxtLink = resolveComponent('NuxtLink');

        const columns: TableColumn<Realm>[] = [
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
            NuxtLink,
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
                        <template v-if="isMaster">
                            <VCButton
                                v-if="realmManagementId !== row.id"
                                size="xs"
                                color="primary"
                                class="me-1"
                                @click.prevent="setRealmManagement(row)"
                            >
                                <VCIcon name="fa6-solid:check" />
                            </VCButton>
                        </template>
                        <VCButton
                            :as="NuxtLink"
                            :to="'/admin/realms/'+ row.id"
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
                            entity-type="realm"
                            :with-text="false"
                            :disabled="!row.builtIn || !hasDropPermission"
                            @deleted="props.deleted"
                        />
                    </div>
                </template>
                <VCTableLoading />
                <VCTableEmpty />
            </VCTable>
        </template>
    </ARealms>
</template>
