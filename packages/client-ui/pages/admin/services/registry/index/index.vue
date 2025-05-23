<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import { PermissionName } from '@privateaim/kit';
import { VCTimeago } from '@vuecs/timeago';
import type { Registry } from '@privateaim/core-kit';
import { BSpinner, BTable } from 'bootstrap-vue-next';
import type { BuildInput } from 'rapiq';
import { ref } from 'vue';
import {
    FEntityDelete, FPagination, FSearch, FTitle, RegistryList,
} from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    components: {
        ListPagination: FPagination,
        ListSearch: FSearch,
        ListTitle: FTitle,
        BSpinner,
        BTable,
        EntityDelete: FEntityDelete,
        RegistryList,
        VCTimeago,
    },
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
                key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left',
            },
            { key: 'options', label: '', tdClass: 'text-left' },
        ];

        const query : BuildInput<Registry> = {
            sort: {
                updated_at: 'DESC',
            },
        };

        const canManage = usePermissionCheck({ name: PermissionName.REGISTRY_MANAGE });

        const registryNode = ref<typeof RegistryList | null>(null);

        const handleDeleted = (item: Registry) => {
            emit('deleted', item);

            if (registryNode.value) {
                registryNode.value.handleDeleted(item);
            }
        };

        return {
            fields,
            query,
            canManage,
            registryNode,
            handleDeleted,
        };
    },
});
</script>
<template>
    <RegistryList
        ref="registryNode"
        :load-on-init="true"
        :query="query"
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
                    <NuxtLink
                        v-if="canManage"
                        v-b-tooltip="'Overview'"
                        :to="'/admin/services/registry/'+data.item.id"
                        class="btn btn-xs btn-outline-primary"
                    >
                        <i class="fa fa-bars" />
                    </NuxtLink>
                    <EntityDelete
                        v-if="canManage"
                        class="btn btn-xs btn-outline-danger ms-1"
                        :entity-id="data.item.id"
                        :entity-type="'registry'"
                        :with-text="false"
                        @deleted="handleDeleted"
                    />
                </template>
                <template #cell(created_at)="data">
                    <VCTimeago :datetime="data.item.created_at" />
                </template>
                <template #cell(updated_at)="data">
                    <VCTimeago :datetime="data.item.updated_at" />
                </template>
                <template #table-busy>
                    <div class="text-center text-danger my-2">
                        <BSpinner class="align-middle" />
                        <strong>Loading...</strong>
                    </div>
                </template>
            </BTable>
        </template>
    </RegistryList>
</template>
