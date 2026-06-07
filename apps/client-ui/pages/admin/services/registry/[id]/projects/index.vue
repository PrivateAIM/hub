<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import type { Registry, RegistryProject } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { TableColumn } from '@vuecs/table';
import type { BuildInput } from 'rapiq';
import { computed, ref, toRefs } from 'vue';
import type { PropType, Ref } from 'vue';
import {
    FEntityDelete,
    FPagination,
    FSearch,
    FTitle,
    RegistryProjectDetails,
    RegistryProjectList,
} from '@privateaim/client-vue';
import { definePageMeta, useToast } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../../../config/layout';

export default {
    components: {
        ListPagination: FPagination,
        ListSearch: FSearch,
        ListTitle: FTitle,
        EntityDelete: FEntityDelete,
        RegistryProjectDetails,
        RegistryProjectList,
    },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            required: true,
        },
    },
    setup(props) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });

        const toast = useToast();
        const refs = toRefs(props);

        const query : BuildInput<RegistryProject> = {
            filter: { registry_id: refs.entity.value.id },
            fields: ['+account_id', '+account_name', '+account_secret'],
        };

        const columns: TableColumn[] = [
            {
                key: 'id',
                label: 'ID',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
            {
                key: 'type',
                label: 'Type',
                headerClass: 'text-left',
                cellClass: 'text-left',
            },
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

        const canEdit = usePermissionCheck({ name: PermissionName.NODE_UPDATE });
        const canDrop = usePermissionCheck({ name: PermissionName.NODE_DELETE });
        const canView = computed(() => canEdit.value || canDrop.value);

        const listNode = ref<null | typeof RegistryProjectList>(null);

        const handleDeleted = (item: RegistryProject) => {
            if (listNode.value) {
                listNode.value.handleDeleted(item);
            }

            toast.show({ variant: 'success', body: 'The project was successfully deleted.' });
        };

        const modalShow = ref<boolean>(false);
        const item : Ref<RegistryProject | null> = ref(null);

        const showDetails = (el: RegistryProject) => {
            item.value = el;

            modalShow.value = true;
        };

        return {
            canView,
            canDrop,
            handleDeleted,
            columns,
            query,
            item,
            modalShow,
            listNode,
            showDetails,
        };
    },
};
</script>
<template>
    <div>
        <registry-project-list
            ref="listNode"
            :query="query"
            :load-on-init="true"
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
                    bordered
                >
                    <template #cell-type="{ row }: { row: any }">
                        <span class="badge bg-fg">
                            {{ row.type }}
                        </span>
                    </template>
                    <template #cell-options="{ row }: { row: any }">
                        <nuxt-link
                            v-if="canView"
                            class="btn btn-xs btn-outline-primary"
                            :to="'/admin/services/registry/'+entity.id+'/projects/'+row.id"
                        >
                            <i class="fa fa-bars" />
                        </nuxt-link>
                        <button
                            type="button"
                            class="btn btn-xs btn-outline-dark ms-1 me-1"
                            @click.prevent="showDetails(row)"
                        >
                            <i class="fa-solid fa-info" />
                        </button>
                        <entity-delete
                            v-if="canDrop"
                            class="btn btn-xs btn-outline-danger"
                            :entity-id="row.id"
                            :entity-type="'registryProject'"
                            :with-text="false"
                            @deleted="handleDeleted"
                        />
                    </template>
                    <template #cell-created_at="{ row }: { row: any }">
                        <timeago :datetime="row.created_at" />
                    </template>
                    <template #cell-updated_at="{ row }: { row: any }">
                        <timeago :datetime="row.updated_at" />
                    </template>
                </VCTable>
            </template>
        </registry-project-list>

        <VCModal v-model:open="modalShow">
            <VCModalContent class="modal-lg">
                <div class="modal-header">
                    <VCModalTitle class="modal-title">
                        <i class="fa-solid fa-diagram-project" /> {{ item ? item.name : 'Unknown' }}
                    </VCModalTitle>
                    <VCModalClose class="btn-close" />
                </div>
                <div class="modal-body">
                    <RegistryProjectDetails
                        v-if="item"
                        :key="item.id"
                        :entity-id="item.id"
                        :realm-id="item.realm_id"
                    />
                </div>
            </VCModalContent>
        </VCModal>
    </div>
</template>
