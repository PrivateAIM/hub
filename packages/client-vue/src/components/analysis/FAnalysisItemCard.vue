<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import { getManyAll } from '@privateaim/core-http-kit';
import type { Analysis, AnalysisNode } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { VCLink } from '@vuecs/link';
import { VCPlaceholder } from '@vuecs/placeholder';
import { VCTimeago } from '@vuecs/timeago';
import type { PropType, Ref, SlotsType } from 'vue';
import {
    computed, 
    defineComponent, 
    onMounted, 
    ref,
} from 'vue';
import type { EntityListSlotName } from '../../core';
import { injectCoreHTTPClient, partitionAnalysisNodeLanes } from '../../core';
import FDisplayName from '../FDisplayName';
import FEntityDelete from '../FEntityDelete';
import FAnalysisNodeDistribution from '../analysis-node/FAnalysisNodeDistribution.vue';
import FAnalysisNodeLane from '../analysis-node/FAnalysisNodeLane.vue';
import FAnalysisStageRail from './FAnalysisStageRail.vue';

export default defineComponent({
    components: {
        FAnalysisNodeDistribution,
        FAnalysisNodeLane,
        FAnalysisStageRail,
        FDisplayName,
        FEntityDelete,
        VCButton,
        VCIcon,
        VCLink,
        VCPlaceholder,
        VCTimeago,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        busy: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['deleted', 'updated', 'executed', 'failed'],
    slots: Object as SlotsType<{
        [EntityListSlotName.ITEM_ACTIONS]: {
            data: Analysis
        }
    }>,
    setup(props, { emit }) {
        const canDelete = usePermissionCheck({ name: PermissionName.ANALYSIS_DELETE });

        const client = injectCoreHTTPClient();

        const nodes : Ref<AnalysisNode[]> = ref([]);
        const nodesBusy = ref(false);
        const nodesFailed = ref(false);
        const loadNodes = async () => {
            nodesBusy.value = true;
            nodesFailed.value = false;

            try {
                // exhaustively paginated — a single page (maxLimit 50) would
                // silently misrepresent the distribution counts and the
                // expander label for fleets beyond the page size.
                nodes.value = await getManyAll((pagination) => client.analysisNode.getMany({
                    filters: { analysisId: props.entity.id },
                    relations: { node: true },
                    sorts: { createdAt: 'ASC' },
                    pagination,
                }));
            } catch {
                // the lanes are a progressive enhancement of the card —
                // a failed load keeps the stage rail intact, but the
                // section must say so instead of silently vanishing.
                nodesFailed.value = true;
            } finally {
                nodesBusy.value = false;
            }
        };

        onMounted(() => {
            if (props.entity.nodes > 0) {
                loadNodes();
            }
        });

        const partition = computed(() => partitionAnalysisNodeLanes(nodes.value));

        const lanesExpanded = ref(false);
        const toggleLanes = () => {
            lanesExpanded.value = !lanesExpanded.value;
        };

        const handleDeleted = (data: Analysis) => {
            emit('deleted', data);
        };

        return {
            VCLink,

            canDelete,
            nodes,
            nodesBusy,
            nodesFailed,
            loadNodes,
            partition,
            lanesExpanded,
            toggleLanes,
            handleDeleted,
        };
    },
});
</script>
<template>
    <div class="flex w-full flex-col">
        <div class="flex flex-row items-center gap-2.5">
            <span class="entity-icon h-7 w-7 flex-none text-[0.8rem]">
                <VCIcon name="fa6-solid:microscope" />
            </span>
            <VCLink
                :to="'/analyses/' + entity.id"
                class="text-[0.95rem] font-bold"
            >
                <FDisplayName
                    :name="entity.name"
                    :display-name="entity.displayName"
                />
            </VCLink>
            <span
                v-if="entity.project"
                class="rounded-full border border-border bg-bg px-2 font-mono text-[0.68rem] text-fg-muted"
            >
                {{ entity.project.name }}
            </span>
            <div class="ms-auto flex items-center gap-1">
                <slot
                    name="itemActions"
                    :data="entity"
                >
                    <small class="me-1.5 whitespace-nowrap text-fg-muted">
                        updated <VCTimeago :datetime="entity.updatedAt" />
                    </small>
                    <VCButton
                        :as="VCLink"
                        :to="'/analyses/' + entity.id"
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
                            :entity-type="'analysis'"
                            :disabled="busy"
                            size="sm"
                            @deleted="handleDeleted"
                        />
                    </template>
                </slot>
            </div>
        </div>

        <FAnalysisStageRail :entity="entity" />

        <div
            v-if="nodes.length > 0"
            class="mt-1 flex flex-col gap-2 overflow-x-auto border-t border-border pt-2"
        >
            <template v-if="partition.summarized">
                <FAnalysisNodeDistribution :entities="nodes" />
                <div
                    v-if="partition.lanes.length > 0"
                    class="flex flex-col gap-1.5"
                >
                    <FAnalysisNodeLane
                        v-for="node in partition.lanes"
                        :key="node.id"
                        :entity="node"
                    />
                </div>
                <div
                    v-if="lanesExpanded"
                    class="flex flex-col gap-1.5"
                >
                    <FAnalysisNodeLane
                        v-for="node in partition.hidden"
                        :key="node.id"
                        :entity="node"
                    />
                </div>
                <button
                    v-if="partition.hidden.length > 0"
                    class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-border
                           bg-transparent py-1 text-xs font-bold text-fg-muted hover:border-primary-600 hover:text-primary-600"
                    @click.prevent="toggleLanes"
                >
                    <VCIcon
                        :name="lanesExpanded ? 'fa6-solid:chevron-up' : 'fa6-solid:chevron-down'"
                        class="text-[0.6rem]"
                    />
                    <template v-if="lanesExpanded">
                        collapse
                    </template>
                    <template v-else>
                        {{ partition.hidden.length }} more nodes — show all
                    </template>
                </button>
            </template>
            <template v-else>
                <div class="flex flex-col gap-1.5">
                    <FAnalysisNodeLane
                        v-for="node in nodes"
                        :key="node.id"
                        :entity="node"
                    />
                </div>
            </template>
        </div>
        <div
            v-else-if="nodesBusy"
            class="mt-1 flex flex-col gap-1.5 border-t border-border pt-2"
            aria-hidden="true"
        >
            <VCPlaceholder
                size="sm"
                width="100%"
            />
            <VCPlaceholder
                size="sm"
                width="92%"
            />
        </div>
        <div
            v-else-if="nodesFailed"
            class="mt-1 flex items-center gap-2 border-t border-border pt-2 text-xs text-fg-muted"
        >
            node details unavailable
            <button
                class="cursor-pointer rounded border border-border bg-transparent px-2 py-0.5 font-bold text-fg-muted
                       hover:border-primary-600 hover:text-primary-600"
                @click.prevent="loadNodes"
            >
                retry
            </button>
        </div>
    </div>
</template>
