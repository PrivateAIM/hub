<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { BTable } from 'bootstrap-vue-next';
import type { User } from '@authup/core-kit';
import {
    PermissionName, isRealmResourceWritable,
} from '@authup/core-kit';
import {
    AEntityDelete, AUsers, useAbilityCheck, useStore,
} from '@authup/client-web-kit';
import { storeToRefs } from 'pinia';
import type { BuildInput } from 'rapiq';
import { FPagination, FSearch, FTitle } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: {
        FPagination, FSearch, FTitle, BTable, AUsers, AEntityDelete,
    },
    emits: ['deleted'],
    setup(props, { emit }) {
        const handleDeleted = (e: User) => {
            emit('deleted', e);
        };

        const store = useStore();
        const { realm, realmManagementId } = storeToRefs(store);

        const query : BuildInput<User> = {
            filter: {
                realm_id: [realmManagementId.value, null],
            },
        };

        const isResourceWritable = (
            resource: User,
        ) => isRealmResourceWritable(realm.value, resource.realm_id);

        const hasEditPermission = useAbilityCheck(PermissionName.USER_EDIT);
        const hasDropPermission = useAbilityCheck(PermissionName.USER_DROP);

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
            { key: 'options', label: '', tdClass: 'text-left' },
        ];

        return {
            fields,
            isResourceWritable,
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
            <BTable
                :items="props.data"
                :fields="fields"
                :busy="props.busy"
                head-variant="'dark'"
                outlined
            >
                <template #cell(options)="data">
                    <NuxtLink
                        :to="'/admin/users/'+ data.item.id"
                        class="btn btn-xs btn-outline-primary me-1"
                        :disabled="!hasEditPermission || !isResourceWritable(data.item)"
                    >
                        <i class="fa-solid fa-bars" />
                    </NuxtLink>
                    <AEntityDelete
                        class="btn btn-xs btn-outline-danger"
                        :entity-id="data.item.id"
                        entity-type="user"
                        :with-text="false"
                        :disabled="!hasDropPermission || !isResourceWritable(data.item)"
                        @deleted="props.deleted"
                    />
                </template>
            </BTable>
        </template>
    </AUsers>
</template>
