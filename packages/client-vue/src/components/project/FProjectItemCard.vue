<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import { getManyAll } from '@privateaim/core-http-kit';
import type { Analysis, Project, ProjectNode } from '@privateaim/core-kit';
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
import FAnalysisStageRail from '../analysis/FAnalysisStageRail.vue';
import FProjectCreator from './FProjectCreator.vue';

const RECENT_ANALYSIS_LIMIT = 5;

export default defineComponent({
    components: {
        FAnalysisStageRail,
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
        const fleetFailed = ref(false);
        const loadProjectNodes = async () => {
            fleetFailed.value = false;

            try {
                // exhaustively paginated — a single page (maxLimit 50) would
                // silently misrepresent the fleet counts for larger projects.
                projectNodes.value = await getManyAll((pagination) => client.projectNode.getMany({
                    filters: { projectId: props.entity.id },
                    pagination,
                }));
            } catch {
                // the fleet strip is a progressive enhancement of the card —
                // a failed load keeps identity + counts intact, but the strip
                // must say so instead of posing as "0 joined".
                fleetFailed.value = true;
            }
        };

        onMounted(() => {
            if (props.entity.nodes > 0) {
                loadProjectNodes();
            }
        });

        onMounted(() => {
            // The counter tells us whether there is anything to fetch, so a
            // project with none costs no request at all.
            if (props.entity.analyses > 0) {
                loadAnalyses();
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

        /**
         * The project's most recent analyses, always shown on the card.
         *
         * Deliberately NOT part of the list request: `analyses` is a counter
         * column on the project and is not an includable relation, and a
         * relation include carries no per-parent limit — it would hydrate
         * EVERY analysis of every project on the page to show five. One
         * bounded request per card is both cheaper and the pattern this card
         * already uses for its node fleet above.
         */
        const analyses : Ref<Analysis[]> = ref([]);
        const analysesBusy = ref(false);
        const analysesFailed = ref(false);

        const loadAnalyses = async () => {
            analysesBusy.value = true;
            analysesFailed.value = false;

            try {
                const { data } = await client.analysis.getMany({
                    filters: { projectId: props.entity.id },
                    sorts: { updatedAt: 'DESC' },
                    pagination: { limit: RECENT_ANALYSIS_LIMIT },
                });

                analyses.value = data;
            } catch {
                // The panel is a progressive enhancement of the card — a failed
                // load must say so rather than render an empty list, which
                // would read as "this project has no analyses".
                analysesFailed.value = true;
            } finally {
                analysesBusy.value = false;
            }
        };

        const handleDeleted = (data: Project) => {
            emit('deleted', data);
        };

        return {
            VCLink,

            analyses,
            analysesBusy,
            analysesFailed,

            canDelete,
            projectNodes,
            fleet,
            fleetFailed,
            loadProjectNodes,
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
            <template v-if="fleetFailed">
                <span class="flex h-2 min-w-16 flex-1 overflow-hidden rounded-full border border-border bg-bg" />
                <span class="flex-none text-fg-muted">
                    status unavailable
                    <button
                        class="ms-1 cursor-pointer rounded border border-border bg-transparent px-1.5 font-bold text-fg-muted
                               hover:border-primary-600 hover:text-primary-600"
                        @click.prevent="loadProjectNodes"
                    >
                        retry
                    </button>
                </span>
            </template>
            <template v-else-if="entity.nodes > 0">
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

        <!--
            Recent analyses sit ABOVE the badge strip, not below it: the strip
            carries `mt-auto` to pin itself to the card's bottom edge, which is
            what lines the badges up across every card in a row. Anything
            rendered after it inherits that variable height and drags the
            badges off the shared baseline.
        -->
        <div
            v-if="entity.analyses > 0"
            class="mt-3 flex flex-col gap-1"
        >
            <span
                v-if="analysesBusy"
                class="px-1.5 text-xs text-fg-muted"
            >Loading analyses…</span>
            <span
                v-else-if="analysesFailed"
                class="px-1.5 text-xs text-error-600"
            >The recent analyses could not be loaded.</span>
            <VCLink
                v-for="analysis in (analysesBusy || analysesFailed ? [] : analyses)"
                :key="analysis.id"
                :to="'/analyses/' + analysis.id"
                class="flex items-center gap-x-2 rounded-md px-1.5 py-1 text-xs transition-colors hover:bg-bg-muted"
            >
                <span class="min-w-0 flex-1 truncate font-medium text-fg">
                    <FDisplayName
                        :name="analysis.name"
                        :display-name="analysis.displayName"
                    />
                </span>
                <FAnalysisStageRail
                    :entity="analysis"
                    compact
                    class="w-24 flex-none"
                />
                <!--
                    Fixed width, not `whitespace-nowrap` alone: the age is the
                    last column, so letting it size to its content ("1 day ago"
                    vs "about 2 months ago") shifted the stage rail a few pixels
                    per row and the rails stopped lining up down the panel.
                -->
                <small class="w-28 flex-none truncate text-right text-fg-muted">
                    <VCTimeago :datetime="analysis.updatedAt" />
                </small>
            </VCLink>
        </div>

        <!--
            `flex-nowrap`, not `flex-wrap`: `mt-auto` pins this strip's BOTTOM
            to the card edge, so a strip that wraps to two lines starts higher
            and its pills fall off the baseline the other cards share. Keeping
            it to one line is what lines the badges up across every card in a
            row; the master-image pill absorbs the pressure by truncating.
        -->
        <div class="mt-auto flex flex-nowrap items-center gap-1.5 pt-3 text-xs text-fg-muted">
            <!--
                The count is a shortcut into the project's analysis list — two
                clicks (card -> project -> Analyses) become one. Only a link
                when there is something to look at: a project with no analyses
                would otherwise offer a route to an empty list.
            -->
            <component
                :is="entity.analyses > 0 ? VCLink : 'span'"
                :to="entity.analyses > 0 ? '/projects/' + entity.id + '/analyses' : undefined"
                class="inline-flex flex-none items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-0.5 text-[0.72rem]"
                :class="entity.analyses > 0 ? 'transition-colors hover:border-primary-600 hover:text-fg' : ''"
            >
                <VCIcon
                    name="fa6-solid:microscope"
                    class="text-[0.66rem]"
                />
                <b :class="entity.analyses > 0 ? 'text-success-600' : 'text-fg'">{{ entity.analyses }}</b>
                {{ entity.analyses === 1 ? 'analysis' : 'analyses' }}
            </component>
            <span
                v-if="entity.masterImage"
                class="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-0.5 font-mono text-[0.68rem]"
            >
                <VCIcon
                    name="fa6-solid:cube"
                    class="flex-none text-[0.62rem]"
                />
                <span class="truncate">{{ entity.masterImage.virtualPath }}</span>
            </span>
            <span
                class="inline-flex max-w-40 flex-none items-center gap-1.5 truncate rounded-full
                       border border-border bg-bg px-2.5 py-0.5 text-[0.72rem]"
            >
                <VCIcon
                    name="fa6-solid:user"
                    class="text-[0.66rem]"
                />
                <FProjectCreator :entity="entity" />
            </span>
            <small class="ms-auto flex-none whitespace-nowrap ps-1">
                <VCTimeago :datetime="entity.updatedAt" />
            </small>
        </div>
    </div>
</template>
