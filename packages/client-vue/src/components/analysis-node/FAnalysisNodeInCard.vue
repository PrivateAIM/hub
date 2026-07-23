<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { VCLink } from '@vuecs/link';
import type { AnalysisBucket, AnalysisNode } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import type { QueryBuildInput } from '@rapiq/core';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { FAnalysisBucket, FAnalysisBucketDownload } from '../analysis-bucket';
import FDisplayName from '../FDisplayName';
import { FAnalysisNodeApprovalCommand } from './FAnalsisNodeApprovalCommand';
import { FAnalysisNodeApprovalStatus } from './FAnalysisNodeApprovalStatus';
import { resolveTextColorClass } from '../../core';

export default defineComponent({
    components: {
        FAnalysisBucket,
        FAnalysisBucketDownload,
        FDisplayName,
        FAnalysisNodeApprovalCommand,
        FAnalysisNodeApprovalStatus,
        VCButton,
        VCIcon,
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
                analysis_id: props.entity.analysis_id,
            },
        } satisfies QueryBuildInput<AnalysisBucket, 3>));

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

            handleDeleted,
            handleFailed,
            handleUpdated,

            resolveTextColorClass,
        };
    },
});
</script>
<template>
    <div class="flex flex-col gap-1 w-full">
        <div class="w-full">
            <div class="flex flex-row items-center">
                <div>
                    <slot
                        name="title"
                        :data="entity"
                    >
                        <VCIcon
                            name="fa6-solid:microscope"
                            class="me-1"
                        />

                        <FDisplayName
                            :name="entity.analysis.name"
                            :display-name="entity.analysis.display_name"
                        />
                    </slot>
                </div>
                <div class="ms-auto flex flex-row gap-1">
                    <slot
                        name="itemActions"
                        :data="entity"
                    >
                        <VCButton
                            :as="VCLink"
                            :to="'/analyses/' + entity.analysis.id"
                            :disabled="busy"
                            size="xs"
                            color="neutral"
                        >
                            <VCIcon name="fa6-solid:bars" />
                        </VCButton>
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
                        <FAnalysisNodeApprovalCommand
                            :entity-id="entity.id"
                            :approval-status="entity.approval_status"
                            :with-icon="true"
                            :element-type="'button'"
                            :command="'approve'"
                            :with-text="false"
                            @updated="handleUpdated"
                        />
                        <FAnalysisNodeApprovalCommand
                            :entity-id="entity.id"
                            :approval-status="entity.approval_status"
                            :with-icon="true"
                            :element-type="'button'"
                            :command="'reject'"
                            :with-text="false"
                            @updated="handleUpdated"
                        />
                    </slot>
                </div>
            </div>
        </div>
        <slot
            name="body"
            :data="entity"
        >
            <div class="flex flex-wrap -mx-2">
                <div class="w-full px-2 md:w-4/12 flex items-center flex-col">
                    <div>
                        <strong><VCIcon name="fa6-solid:server" /> Node</strong>
                    </div>
                    <div>
                        {{ entity.node.name }}
                    </div>
                </div>
                <div class="w-full px-2 md:w-4/12 flex items-center flex-col">
                    <div>
                        <strong><VCIcon name="fa6-solid:heart-pulse" /> Status</strong>
                    </div>
                    <div>
                        <FAnalysisNodeApprovalStatus
                            :status="entity.approval_status"
                        >
                            <template #default="slotProps">
                                <span
                                    :class="resolveTextColorClass(slotProps.classSuffix)"
                                >
                                    {{ slotProps.statusText }}
                                </span>
                            </template>
                        </FAnalysisNodeApprovalStatus>
                    </div>
                </div>
                <div class="w-full px-2 md:w-4/12 flex items-center flex-col">
                    <div>
                        <strong><VCIcon name="fa6-solid:user" /> Creator</strong>
                    </div>
                    <div>
                        <template v-if="entity.analysis.user_id">
                            {{ entity.analysis.user_id }}
                        </template>
                    </div>
                </div>
                <!-- todo: this is only possible when authup supports user access from other realm -->
                <!--
                <div class="flex grow items-center flex-col">
                    <div>
                        <strong><i class="fa fa-user" /> Creator</strong>
                    </div>
                    <div>
                        <AUser :entity-id="entity.user_id">
                            <template #default="{ data }">
                                {{ data.name }}
                            </template>
                        </AUser>
                    </div>
                </div>
                -->
            </div>
        </slot>
        <slot
            name="footer"
            :data="entity"
        >
            <div class="flex flex-row">
                <div class="">
                    <small>
                        <span class="text-fg-muted">
                            created
                        </span>
                        <VCTimeago :datetime="entity.created_at" />
                    </small>
                </div>
                <div class="ms-auto">
                    <small>
                        <span class="text-fg-muted">
                            updated
                        </span>
                        <VCTimeago :datetime="entity.updated_at" />
                    </small>
                </div>
            </div>
        </slot>
    </div>
</template>
