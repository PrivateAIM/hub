<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import { getManyAll } from '@privateaim/core-http-kit';
import type { Project, ProjectNode } from '@privateaim/core-kit';
import { ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { VCLink } from '@vuecs/link';
import { VCTimeago } from '@vuecs/timeago';
import type { PropType, Ref, SlotsType } from 'vue';
import {
    computed, 
    defineComponent, 
    onMounted, 
    ref,
} from 'vue';
import type { EntityListSlotName } from '../../core';
import { injectCoreHTTPClient } from '../../core';
import FDisplayName from '../FDisplayName';
import FEntityDelete from '../FEntityDelete';
import FProjectCreator from './FProjectCreator.vue';

export default defineComponent({
    components: {
        FProjectCreator,
        FDisplayName,
        FEntityDelete,
        VCButton,
        VCIcon,
        VCLink,
        VCTimeago,
    },
    props: {
        entity: {
            type: Object as PropType<Project>,
            required: true,
        },
        busy: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['deleted'],
    slots: Object as SlotsType<{
        [EntityListSlotName.ITEM_ACTIONS]: {
            data: Project
        }
    }>,
    setup(props, { emit }) {
        const canDelete = usePermissionCheck({ name: PermissionName.PROJECT_DELETE });

        const client = injectCoreHTTPClient();

        const projectNodes : Ref<ProjectNode[]> = ref([]);
        const loadProjectNodes = async () => {
            try {
                // exhaustively paginated — a single page (maxLimit 50) would
                // silently misrepresent the fleet counts for larger projects.
                projectNodes.value = await getManyAll((pagination) => client.projectNode.getMany({
                    filters: { projectId: props.entity.id },
                    pagination,
                }));
            } catch {
                // the fleet strip is a progressive enhancement of the card —
                // a failed load keeps identity + counts intact.
            }
        };

        onMounted(() => {
            if (props.entity.nodes > 0) {
                loadProjectNodes();
            }
        });

        const fleet = computed(() => {
            const counts = {
                approved: 0, 
                pending: 0, 
                rejected: 0, 
            };
            for (const projectNode of projectNodes.value) {
                switch (projectNode.approvalStatus) {
                    case ProjectNodeApprovalStatus.APPROVED:
                        counts.approved++;
                        break;
                    case ProjectNodeApprovalStatus.REJECTED:
                        counts.rejected++;
                        break;
                    default:
                        counts.pending++;
                }
            }

            return counts;
        });

        const handleDeleted = (data: Project) => {
            emit('deleted', data);
        };

        return {
            VCLink,

            canDelete,
            projectNodes,
            fleet,
            handleDeleted,
        };
    },
});
</script>
<template>
    <div
        class="flex h-full w-full flex-col gap-3 rounded-lg border border-border bg-bg-elevated p-4
               shadow-[0_4px_25px_0_rgba(0,0,0,0.07)] transition-colors hover:border-primary-600/50"
    >
        <div class="flex flex-row items-start gap-2.5">
            <span class="entity-icon h-9 w-9 flex-none text-[0.95rem]">
                <VCIcon name="fa6-solid:diagram-project" />
            </span>
            <div class="min-w-0 flex-1 leading-tight">
                <VCLink
                    :to="'/projects/' + entity.id"
                    class="block truncate text-[0.92rem] font-bold"
                >
                    <FDisplayName
                        :name="entity.name"
                        :display-name="entity.displayName"
                    />
                </VCLink>
                <span class="font-mono text-[0.68rem] text-fg-muted">{{ entity.name }}</span>
            </div>
            <div class="flex flex-none items-center gap-1">
                <slot
                    name="itemActions"
                    :data="entity"
                >
                    <VCButton
                        :as="VCLink"
                        :to="'/projects/' + entity.id"
                        :disabled="busy"
                        size="xs"
                        color="neutral"
                    >
                        <VCIcon name="fa6-solid:bars" />
                    </VCButton>
                    <template v-if="canDelete">
                        <FEntityDelete
                            :with-text="false"
                            :entity-id="entity.id"
                            :entity-type="'project'"
                            :disabled="busy || entity.analyses > 0"
                            size="sm"
                            @deleted="handleDeleted"
                        />
                    </template>
                </slot>
            </div>
        </div>

        <p
            v-if="entity.description"
            class="m-0 line-clamp-2 text-[0.8rem] text-fg-muted"
        >
            {{ entity.description }}
        </p>

        <div class="flex items-center gap-2.5 text-xs">
            <span class="flex-none font-bold text-fg-muted">Nodes</span>
            <template v-if="entity.nodes > 0">
                <span class="flex h-2 min-w-16 flex-1 overflow-hidden rounded-full border border-border bg-bg">
                    <span
                        v-if="fleet.approved"
                        class="h-full bg-success-600"
                        :style="{ flexGrow: fleet.approved }"
                    />
                    <span
                        v-if="fleet.pending"
                        class="h-full bg-warning-600"
                        :style="{ flexGrow: fleet.pending }"
                    />
                    <span
                        v-if="fleet.rejected"
                        class="h-full bg-error-600"
                        :style="{ flexGrow: fleet.rejected }"
                    />
                </span>
                <span
                    v-if="projectNodes.length > 0"
                    class="flex-none whitespace-nowrap tabular-nums text-fg-muted"
                >
                    <b class="text-success-600">{{ fleet.approved }}</b> joined
                    <template v-if="fleet.pending">
                        · <b class="text-warning-600">{{ fleet.pending }}</b> invited
                    </template>
                    <template v-if="fleet.rejected">
                        · <b class="text-error-600">{{ fleet.rejected }}</b> declined
                    </template>
                </span>
                <span
                    v-else
                    class="flex-none whitespace-nowrap tabular-nums text-fg-muted"
                >{{ entity.nodes }} nodes</span>
            </template>
            <template v-else>
                <span class="flex h-2 min-w-16 flex-1 overflow-hidden rounded-full border border-border bg-bg" />
                <span class="flex-none text-fg-muted">no nodes assigned yet</span>
            </template>
        </div>

        <div class="mt-auto flex flex-wrap items-center gap-1.5 pt-1 text-xs text-fg-muted">
            <span class="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-0.5 text-[0.72rem]">
                <VCIcon
                    name="fa6-solid:microscope"
                    class="text-[0.66rem]"
                />
                <b :class="entity.analyses > 0 ? 'text-success-600' : 'text-fg'">{{ entity.analyses }}</b>
                {{ entity.analyses === 1 ? 'analysis' : 'analyses' }}
            </span>
            <span
                v-if="entity.masterImage"
                class="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-0.5 font-mono text-[0.68rem]"
            >
                <VCIcon
                    name="fa6-solid:cube"
                    class="text-[0.62rem]"
                />
                {{ entity.masterImage.virtualPath }}
            </span>
            <span class="inline-flex max-w-40 items-center gap-1.5 truncate rounded-full border border-border bg-bg px-2.5 py-0.5 text-[0.72rem]">
                <VCIcon
                    name="fa6-solid:user"
                    class="text-[0.66rem]"
                />
                <FProjectCreator :entity="entity" />
            </span>
            <small class="ms-auto whitespace-nowrap">
                <VCTimeago :datetime="entity.updatedAt" />
            </small>
        </div>
    </div>
</template>
