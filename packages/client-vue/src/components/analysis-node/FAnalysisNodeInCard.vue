<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ARealm } from '@authup/client-web-kit';
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { VCLink } from '@vuecs/link';
import { VCTimeago } from '@vuecs/timeago';
import type { AnalysisBucket, AnalysisNode } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import type { QueryBuildInput } from '@rapiq/core';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { FAnalysisBucket, FAnalysisBucketDownload } from '../analysis-bucket';
import FDisplayName from '../FDisplayName';
import { FAnalysisNodeApprovalCommand } from './FAnalsisNodeApprovalCommand';
import {
    resolveAnalysisNodeApprovalState,
    resolveAnalysisNodeExecutionState,
} from '../../core';

export default defineComponent({
    components: {
        ARealm,
        FAnalysisBucket,
        FAnalysisBucketDownload,
        FDisplayName,
        FAnalysisNodeApprovalCommand,
        VCButton,
        VCIcon,
        VCTimeago,
    },
    props: {
        entity: {
            type: Object as PropType<AnalysisNode>,
            required: true,
        },
        busy: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['deleted', 'failed', 'updated'],
    setup(props, { emit }) {
        const bucketQuery = computed<QueryBuildInput<AnalysisBucket, 3>>(() => ({
            filters: {
                type: AnalysisBucketType.CODE,
                analysisId: props.entity.analysisId,
            },
        } satisfies QueryBuildInput<AnalysisBucket, 3>));

        const approvalState = computed(() => resolveAnalysisNodeApprovalState(props.entity));
        const executionState = computed(() => resolveAnalysisNodeExecutionState(props.entity));

        const handleDeleted = (data: AnalysisNode) => {
            emit('deleted', data);
        };

        const handleFailed = (data: Error) => {
            emit('failed', data);
        };

        const handleUpdated = (data: AnalysisNode) => {
            emit('updated', data);
        };

        return {
            VCLink,

            bucketQuery,
            approvalState,
            executionState,

            handleDeleted,
            handleFailed,
            handleUpdated,
        };
    },
});
</script>
<template>
    <div
        class="relative flex w-full flex-col gap-2"
        :class="approvalState === 'pending' ?
            'ps-3 before:absolute before:inset-y-0 before:start-0 before:w-[3px] before:rounded-full before:bg-warning-600 before:content-[\'\']' :
            ''"
    >
        <div class="flex flex-row items-center gap-1.5 text-xs text-fg-muted">
            <VCIcon
                name="fa6-solid:globe"
                class="text-[0.7rem]"
            />
            <ARealm :query-filters="{ id: entity.analysisRealmId }">
                <template #default="scope">
                    <b
                        v-if="scope && scope.data"
                        class="text-fg"
                    >{{ scope.data.name }}</b>
                    <b
                        v-else
                        class="text-fg"
                    >{{ entity.analysisRealmId }}</b>
                </template>
            </ARealm>
            requests execution on your node
            <b class="text-fg">{{ entity.node?.name ?? entity.nodeId }}</b>
            <small class="ms-auto whitespace-nowrap">
                requested <VCTimeago :datetime="entity.createdAt" />
            </small>
        </div>

        <div class="flex flex-row items-center gap-2.5">
            <span class="entity-icon h-7 w-7 flex-none text-[0.8rem]">
                <VCIcon name="fa6-solid:microscope" />
            </span>
            <VCLink
                :to="'/analyses/' + entity.analysisId"
                class="text-[0.95rem] font-bold"
            >
                <FDisplayName
                    :name="entity.analysis?.name ?? entity.analysisId"
                    :display-name="entity.analysis?.displayName"
                />
            </VCLink>
            <span
                class="ms-auto rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wide"
                :class="{
                    'bg-warning-600/15 text-warning-600': approvalState === 'pending',
                    'bg-success-600/15 text-success-600': approvalState === 'approved',
                    'bg-error-600/15 text-error-600': approvalState === 'rejected',
                }"
            >
                {{ approvalState }}
            </span>
        </div>

        <div
            v-if="entity.artifactTag || approvalState === 'approved'"
            class="flex flex-wrap items-center gap-1.5"
        >
            <span
                v-if="entity.artifactTag"
                class="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-0.5 font-mono text-[0.68rem] text-fg-muted"
            >
                <VCIcon
                    name="fa6-solid:cube"
                    class="text-[0.62rem]"
                />
                {{ entity.artifactTag }}
            </span>
            <span
                v-if="approvalState === 'approved' && executionState !== 'waiting'"
                class="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-0.5 text-[0.68rem] font-bold"
                :class="{
                    'text-primary-600': executionState === 'running',
                    'text-success-600': executionState === 'done',
                    'text-error-600': executionState === 'failed',
                }"
            >
                <VCIcon
                    v-if="executionState === 'running'"
                    name="fa6-solid:rotate"
                    class="animate-spin text-[0.62rem]"
                />
                {{ executionState }}
                <template v-if="executionState === 'running' && typeof entity.executionProgress === 'number'">
                    · {{ entity.executionProgress }}%
                </template>
            </span>
        </div>

        <div
            v-if="approvalState === 'rejected' && entity.comment"
            class="rounded-md border border-dashed border-border bg-bg px-2.5 py-1.5 text-xs text-fg-muted"
        >
            <VCIcon
                name="fa6-solid:comment"
                class="me-1 text-[0.68rem]"
            />
            “{{ entity.comment }}”
        </div>

        <div class="flex flex-row items-center gap-1.5 border-t border-border pt-2">
            <slot
                name="itemActions"
                :data="entity"
            >
                <FAnalysisNodeApprovalCommand
                    :entity-id="entity.id"
                    :approval-status="entity.approvalStatus"
                    :with-icon="true"
                    :element-type="'button'"
                    :command="'approve'"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
                <FAnalysisNodeApprovalCommand
                    :entity-id="entity.id"
                    :approval-status="entity.approvalStatus"
                    :with-icon="true"
                    :element-type="'button'"
                    :command="'reject'"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
                <FAnalysisBucket :query="bucketQuery">
                    <template #default="{ data: bucket }">
                        <FAnalysisBucketDownload
                            v-if="bucket"
                            :entity="bucket"
                            :with-icon="true"
                            :with-text="false"
                        />
                    </template>
                </FAnalysisBucket>
                <VCButton
                    :as="VCLink"
                    :to="'/analyses/' + entity.analysisId"
                    :disabled="busy"
                    size="xs"
                    color="neutral"
                    class="ms-auto"
                >
                    <VCIcon name="fa6-solid:bars" />
                </VCButton>
            </slot>
        </div>
    </div>
</template>
