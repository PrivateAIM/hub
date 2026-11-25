<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import {
    FEvents,
    FLogs,
    FMasterImageCommand,
    FProcessStatus,
    FProgressBar,
    createEntityManager,
    resolveTextColorClass,
} from '@privateaim/client-vue';
import type { MasterImage } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { PermissionName, ProcessStatus, humanFileSize } from '@privateaim/kit';
import type { Event, Log } from '@privateaim/telemetry-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { QueryBuildInput } from '@rapiq/core';
import { VCIcon } from '@vuecs/icon';
import type { NavigationItem } from '@vuecs/navigation';
import { VCTimeago } from '@vuecs/timeago';
import { computed, defineComponent } from 'vue';
import {
    createError,
    definePageMeta,
    navigateTo,
    useRoute,
    useToast,
} from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

/**
 * One master image: what it is, why its last build failed, and the
 * telemetry trail (logs and events) recorded against its id.
 */
export default defineComponent({
    components: {
        FEvents,
        FLogs,
        FMasterImageCommand,
        FProcessStatus,
        FProgressBar,
        VCIcon,
        VCTimeago,
    },
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.MASTER_IMAGE_MANAGE,
            ],
        });

        const toast = useToast();
        const route = useRoute('admin-services-master-images-id');

        const manager = createEntityManager({
            type: DomainType.MASTER_IMAGE,
            props: { entityId: route.params.id as string },
            onFailed(e) {
                if (toast) {
                    toast.show({ variant: 'warning', body: e.message }, { pos: 'top-center' });
                }
            },
        });

        await manager.resolve();

        if (!manager.data.value) {
            await navigateTo({ path: '/admin/services/master-images' });

            throw createError({});
        }

        const entity = computed(() => manager.data.value as MasterImage);
        const { id } = entity.value;

        const tabs: NavigationItem[] = [
            {
                name: '',
                icon: 'fa6-solid:arrow-left',
                url: '/admin/services/master-images',
            },
            {
                name: 'Overview',
                icon: 'fa6-solid:bars',
                url: `/admin/services/master-images/${id}`,
            },
        ];

        const progress = computed(() => {
            if (entity.value.buildStatus === ProcessStatus.EXECUTED) {
                return 100;
            }

            return entity.value.buildProgress || 0;
        });

        const isFailed = computed(() => entity.value.buildStatus === ProcessStatus.FAILED);

        // `executionFailed` is the builder's failure event key; its `data.error`
        // holds the reason (server-core's master-image builder aggregator).
        const lastFailureQuery: QueryBuildInput<Event, 3> = {
            filters: {
                refType: DomainType.MASTER_IMAGE,
                refId: id,
                name: 'executionFailed',
            },
            sorts: { createdAt: 'DESC' },
            pagination: { limit: 1 },
        };

        const eventQuery: QueryBuildInput<Event, 3> = {
            filters: {
                refType: DomainType.MASTER_IMAGE,
                refId: id,
            },
            sorts: { createdAt: 'DESC' },
            pagination: { limit: 25 },
        };

        const logQuery: QueryBuildInput<Log, 3> = {
            filters: {
                labels: {
                    [LogFlag.REF_TYPE]: DomainType.MASTER_IMAGE,
                    [LogFlag.REF_ID]: id,
                },
            },
            pagination: { limit: 50 },
        };

        const formatSize = (value: number | null) => (typeof value === 'number' ? humanFileSize(value) : '–');

        const handleFailed = (e: Error) => {
            toast.show({ variant: 'warning', body: e.message }, { pos: 'top-center' });
        };

        return {
            entity,
            eventQuery,
            formatSize,
            handleFailed,
            handleUpdated: manager.updated,
            isFailed,
            lastFailureQuery,
            logQuery,
            progress,
            resolveTextColorClass,
            tabs,
        };
    },
});
</script>
<template>
    <div class="flex flex-col gap-3">
        <div class="flex flex-row flex-wrap items-center gap-3">
            <h1 class="title no-border mb-0 min-w-0 break-all">
                <VCIcon
                    name="fa6-solid:atom"
                    class="me-1"
                /> <span class="font-mono">{{ entity.virtualPath }}</span>
                <span class="sub-title ms-1">Details</span>
            </h1>
            <div class="ms-auto flex items-center gap-3">
                <FProcessStatus :value="entity.buildStatus">
                    <template #default="{ value, iconName, iconClass, classSuffix }">
                        <span class="whitespace-nowrap">
                            <VCIcon
                                :name="iconName"
                                :class="[iconClass, resolveTextColorClass(classSuffix)]"
                            /> <span class="ms-1">{{ value }}</span>
                        </span>
                    </template>
                </FProcessStatus>
                <FMasterImageCommand
                    :command="'build'"
                    :entity="entity"
                    :with-icon="true"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
            </div>
        </div>

        <div>
            <VCNavItems
                :data="tabs"
                variant="pills"
            />
        </div>

        <FEvents
            v-if="isFailed"
            :query="lastFailureQuery"
        >
            <template #body="{ data }">
                <div
                    v-if="data.length > 0"
                    class="rounded-md border border-error-600 px-3 py-2"
                >
                    <div class="font-bold text-error-600">
                        Last build failed <VCTimeago :datetime="data[0].createdAt" />
                    </div>
                    <div
                        v-if="data[0].data && data[0].data.error"
                        class="mt-1 whitespace-pre-wrap break-words font-mono text-sm"
                    >
                        {{ data[0].data.error }}
                    </div>
                    <div class="mt-1 text-sm text-fg-muted">
                        The logs below hold the build output.
                    </div>
                </div>
            </template>
        </FEvents>

        <div class="flex flex-col gap-4 lg:flex-row">
            <div class="flex min-w-0 flex-col gap-3 lg:basis-2/3">
                <div class="card-grey card">
                    <div class="card-body flex flex-col gap-2">
                        <FProgressBar
                            :progress="progress"
                            show-text
                        />
                        <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                            <dt class="text-fg-muted">
                                Name
                            </dt>
                            <dd>{{ entity.name }}</dd>
                            <dt class="text-fg-muted">
                                Group
                            </dt>
                            <dd class="font-mono">
                                {{ entity.groupVirtualPath }}
                            </dd>
                            <dt class="text-fg-muted">
                                Path
                            </dt>
                            <dd class="font-mono break-all">
                                {{ entity.path || '–' }}
                            </dd>
                            <dt class="text-fg-muted">
                                Command
                            </dt>
                            <dd class="font-mono break-all">
                                {{ entity.command || '–' }}
                            </dd>
                            <dt class="text-fg-muted">
                                Size
                            </dt>
                            <dd class="tabular-nums">
                                {{ formatSize(entity.buildSize) }}
                            </dd>
                            <dt class="text-fg-muted">
                                Hash
                            </dt>
                            <dd class="font-mono break-all">
                                {{ entity.buildHash || '–' }}
                            </dd>
                            <dt class="text-fg-muted">
                                Updated
                            </dt>
                            <dd><VCTimeago :datetime="entity.updatedAt" /></dd>
                        </dl>
                    </div>
                </div>
                <div>
                    <h6><VCIcon name="fa6-solid:terminal" /> Logs</h6>
                    <FLogs :query="logQuery" />
                </div>
            </div>
            <div class="min-w-0 lg:basis-1/3">
                <h6><VCIcon name="fa6-solid:bullhorn" /> Events</h6>
                <FEvents :query="eventQuery" />
            </div>
        </div>
    </div>
</template>
