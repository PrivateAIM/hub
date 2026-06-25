<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import { PermissionName } from '@privateaim/kit';
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { VCTimeago } from '@vuecs/timeago';
import type { TableColumn } from '@vuecs/table';
import type { Registry } from '@privateaim/core-kit';
import type { BuildInput } from 'rapiq';
import { ref, resolveComponent } from 'vue';
import {
    FEntityDelete,
    FPagination,
    FSearch,
    FTitle,
    RegistryList,
} from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    components: {
        ListPagination: FPagination,
        ListSearch: FSearch,
        ListTitle: FTitle,
        EntityDelete: FEntityDelete,
        RegistryList,
        VCButton,
        VCIcon,
        VCTimeago,
    },
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });

        const columns: TableColumn<Registry>[] = [
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

        const query : BuildInput<Registry> = { sort: { updated_at: 'DESC' } };

        const canManage = usePermissionCheck({ name: PermissionName.REGISTRY_MANAGE });

        const registryNode = ref<typeof RegistryList | null>(null);

        const NuxtLink = resolveComponent('NuxtLink');

        const handleDeleted = (item: Registry) => {
            emit('deleted', item);

            if (registryNode.value) {
                registryNode.value.handleDeleted(item);
            }
        };

        return {
            columns,
            query,
            canManage,
            registryNode,
            handleDeleted,
            NuxtLink,
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
            <VCTable
                :data="props.data"
                :columns="columns"
                :busy="props.busy"
            >
                <template #cell-options="{ row }">
                    <VCButton
                        v-if="canManage"
                        :as="NuxtLink"
                        title="Overview"
                        :to="'/admin/services/registry/'+row.id"
                        size="xs"
                        color="primary"
                        variant="outline"
                    >
                        <VCIcon name="fa6-solid:bars" />
                    </VCButton>
                    <EntityDelete
                        v-if="canManage"
                        size="xs"
                        class="ms-1"
                        :entity-id="row.id"
                        :entity-type="'registry'"
                        :with-text="false"
                        @deleted="handleDeleted"
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
    </RegistryList>
</template>
