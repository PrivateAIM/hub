<!--
  - Copyright (c) 2022-2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import {
    FEvents,
    FLogs,
    FMasterImageCommand,
    FMasterImageStatusSummary,
    FMasterImages,
    FPagination,
    FProcessStatus,
    FSearch,
    FTitle,
    MASTER_IMAGE_SEARCH_FIELDS,
    MASTER_IMAGE_SYNCHRONIZER_LOG_COMPONENT,
    MasterImageStatusFilter,
    buildMasterImageStatusFilters,
    resolveTextColorClass,
} from '@privateaim/client-vue';
import type { MasterImage } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { PermissionName, humanFileSize } from '@privateaim/kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { Event, Log } from '@privateaim/telemetry-kit';
import type { QueryBuildInput } from '@rapiq/core';
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import type { TableColumn } from '@vuecs/table';
import { VCTimeago } from '@vuecs/timeago';
import type { NavigationItem } from '@vuecs/navigation';
import {
    computed,
    defineComponent,
    nextTick,
    ref,
    resolveComponent,
    useTemplateRef,
    watch,
} from 'vue';
import { definePageMeta } from '#imports';
import { useToast } from '../../../../composables/toast';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineComponent({
    components: {
        FEvents,
        FLogs,
        FMasterImageCommand,
        FMasterImageStatusSummary,
        FMasterImages,
        FPagination,
        FProcessStatus,
        FSearch,
        FTitle,
        VCButton,
        VCIcon,
        VCTimeago,
    },
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.MASTER_IMAGE_MANAGE,
            ],
        });

        const toast = useToast();

        const tabs: NavigationItem[] = [
            {
                name: '',
                icon: 'fa6-solid:arrow-left',
                url: '/admin/services',
            },
            {
                name: 'overview',
                url: '/admin/services/master-images',
                icon: 'fa6-solid:bars',
            },
        ];

        const columns: TableColumn<MasterImage>[] = [
            {
                key: 'buildStatus', 
                label: 'Status', 
                headerClass: 'text-left', 
                cellClass: 'text-left',
            },
            {
                key: 'virtualPath', 
                label: 'Path', 
                headerClass: 'text-left', 
                cellClass: 'text-left',
            },
            {
                key: 'buildSize', 
                label: 'Size', 
                headerClass: 'text-right', 
                cellClass: 'text-right',
            },
            {
                key: 'updatedAt', 
                label: 'Updated', 
                headerClass: 'text-left', 
                cellClass: 'text-left',
            },
            {
                key: 'options', 
                label: '', 
                cellClass: 'text-right', 
            },
        ];

        const status = ref<`${MasterImageStatusFilter}`>(MasterImageStatusFilter.ALL);
        const summary = useTemplateRef<{ reload: () => Promise<void> }>('summary');
        const list = useTemplateRef<{ load: () => Promise<void> }>('list');

        const query = computed<QueryBuildInput<MasterImage, 3>>(() => {
            const filters = buildMasterImageStatusFilters(status.value);

            return {
                ...(filters ? { filters } : {}),
                sorts: { virtualPath: 'ASC' },
            };
        });

        // `flush: 'post'`: the list must have re-rendered with the new
        // `:query` before load() reads it, or it reloads with the old filter.
        watch(query, async () => {
            await nextTick();
            await list.value?.load();
        }, { flush: 'post' });

        const syncEventQuery: QueryBuildInput<Event, 3> = {
            filters: {
                refType: DomainType.MASTER_IMAGE,
                scope: 'synchronizer',
            },
            sorts: { createdAt: 'DESC' },
            pagination: { limit: 10 },
        };

        const syncLogQuery: QueryBuildInput<Log, 3> = {
            filters: { labels: { [LogFlag.COMPONENT]: MASTER_IMAGE_SYNCHRONIZER_LOG_COMPONENT } },
            pagination: { limit: 20 },
        };

        const handleExecuted = () => {
            summary.value?.reload();
        };

        const handleFailed = (e: Error) => {
            toast.show({ body: e.message, variant: 'warning' }, { pos: 'top-center' });
        };

        const formatSize = (value: number | null) => (typeof value === 'number' ? humanFileSize(value) : '–');

        const NuxtLink = resolveComponent('NuxtLink');

        return {
            MASTER_IMAGE_SEARCH_FIELDS,
            NuxtLink,
            columns,
            formatSize,
            handleExecuted,
            handleFailed,
            query,
            resolveTextColorClass,
            status,
            syncEventQuery,
            syncLogQuery,
            tabs,
        };
    },
});
</script>
<template>
    <div class="flex flex-col gap-3">
        <div class="flex flex-row flex-wrap items-start gap-3">
            <div>
                <h1 class="title no-border mb-0">
                    <VCIcon
                        name="fa6-solid:atom"
                        class="me-1"
                    /> Master Images
                </h1>
                <p class="mt-1 text-sm text-fg-muted">
                    Base images used to build analysis images. Sync reads them from the GitHub repository;
                    each image is then built and pushed to every registered registry.
                </p>
            </div>
            <div class="ms-auto">
                <FMasterImageCommand
                    :command="'sync'"
                    @executed="handleExecuted"
                    @failed="handleFailed"
                >
                    <template #default="props">
                        <VCButton
                            color="primary"
                            @click.prevent="props.execute"
                        >
                            <span class="me-2">{{ props.commandText }}</span> <VCIcon
                                :name="props.iconName"
                                :class="props.iconClass"
                            />
                        </VCButton>
                    </template>
                </FMasterImageCommand>
            </div>
        </div>
        <div>
            <VCNavItems
                :data="tabs"
                variant="pills"
            />
        </div>

        <FMasterImageStatusSummary
            ref="summary"
            v-model="status"
        />

        <div class="flex flex-col gap-4 lg:flex-row">
            <div class="min-w-0 lg:basis-2/3">
                <FMasterImages
                    ref="list"
                    :query="query"
                >
                    <template #header="props">
                        <FTitle />
                        <FSearch
                            :fields="MASTER_IMAGE_SEARCH_FIELDS"
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
                        <VCTable
                            :data="props.data"
                            :columns="columns"
                            :busy="props.busy"
                        >
                            <template #cell-buildStatus="{ row }">
                                <FProcessStatus :value="row.buildStatus">
                                    <template #default="{ value, iconName, iconClass, classSuffix }">
                                        <span class="whitespace-nowrap">
                                            <VCIcon
                                                :name="iconName"
                                                :class="[iconClass, resolveTextColorClass(classSuffix)]"
                                            /> <span class="ms-1">{{ value }}</span>
                                        </span>
                                    </template>
                                </FProcessStatus>
                            </template>
                            <template #cell-virtualPath="{ row }">
                                <NuxtLink
                                    :to="'/admin/services/master-images/' + row.id"
                                    class="font-mono text-sm"
                                >
                                    {{ row.virtualPath }}
                                </NuxtLink>
                            </template>
                            <template #cell-buildSize="{ row }">
                                <span class="tabular-nums">{{ formatSize(row.buildSize) }}</span>
                            </template>
                            <template #cell-updatedAt="{ row }">
                                <VCTimeago :datetime="row.updatedAt" />
                            </template>
                            <template #cell-options="{ row }">
                                <div class="flex items-center justify-end gap-1">
                                    <FMasterImageCommand
                                        :command="'build'"
                                        :entity="row"
                                        :with-icon="true"
                                        :with-text="false"
                                        @executed="handleExecuted"
                                        @failed="handleFailed"
                                    />
                                    <VCButton
                                        :as="NuxtLink"
                                        size="xs"
                                        color="primary"
                                        variant="outline"
                                        :to="'/admin/services/master-images/' + row.id"
                                    >
                                        <VCIcon name="fa6-solid:bars" />
                                    </VCButton>
                                </div>
                            </template>
                            <VCTableLoading />
                            <VCTableEmpty />
                        </VCTable>
                    </template>
                </FMasterImages>
            </div>
            <div class="flex min-w-0 flex-col gap-3 lg:basis-1/3">
                <div>
                    <h6><VCIcon name="fa6-solid:rotate" /> Sync events</h6>
                    <FEvents :query="syncEventQuery" />
                </div>
                <div>
                    <h6><VCIcon name="fa6-solid:terminal" /> Sync logs</h6>
                    <FLogs :query="syncLogQuery" />
                </div>
            </div>
        </div>
    </div>
</template>
