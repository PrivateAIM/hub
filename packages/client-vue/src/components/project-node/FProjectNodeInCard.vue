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
import type { MasterImage, ProjectNode } from '@privateaim/core-kit';
import { NodeType, ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import type { PropType, Ref } from 'vue';
import {
    computed, 
    defineComponent, 
    onMounted, 
    ref,
} from 'vue';
import FDisplayName from '../FDisplayName';
import { FProjectInForm } from '../project/FProjectInForm';
import { FProjectNodeApprovalCommand } from './FProjectNodeApprovalCommand';
import { injectCoreHTTPClient } from '../../core';

export default defineComponent({
    components: {
        ARealm,
        FDisplayName,
        FProjectInForm,
        FProjectNodeApprovalCommand,
        VCButton,
        VCIcon,
        VCLink,
        VCTimeago,
    },
    props: {
        entity: {
            type: Object as PropType<ProjectNode>,
            required: true,
        },
        busy: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['deleted', 'failed', 'updated'],
    setup(props, { emit }) {
        const modal = ref<boolean>(false);
        const toggleModal = () => {
            modal.value = !modal.value;
        };

        const approvalState = computed(() => {
            switch (props.entity.approvalStatus) {
                case ProjectNodeApprovalStatus.APPROVED:
                    return 'approved';
                case ProjectNodeApprovalStatus.REJECTED:
                    return 'rejected';
                default:
                    return 'pending';
            }
        });

        const isAggregator = computed(() => props.entity.node?.type === NodeType.AGGREGATOR);

        const client = injectCoreHTTPClient();

        const masterImage : Ref<MasterImage | null> = ref(null);
        const loadMasterImage = async (id: MasterImage['id']) => {
            try {
                const response = await client.masterImage.getOne(id);
                masterImage.value = response.data;
            } catch {
                // the image chip is a progressive enhancement — without it
                // the invitation is still decidable.
            }
        };

        onMounted(() => {
            const masterImageId = props.entity.project?.masterImageId;
            if (masterImageId) {
                loadMasterImage(masterImageId);
            }
        });

        const handleDeleted = (data: ProjectNode) => {
            emit('deleted', data);
        };

        const handleFailed = (data: Error) => {
            emit('failed', data);
        };

        const handleUpdated = (data: ProjectNode) => {
            emit('updated', data);
        };

        return {
            VCLink,

            modal,
            toggleModal,
            approvalState,
            isAggregator,
            masterImage,

            handleDeleted,
            handleFailed,
            handleUpdated,
        };
    },
});
</script>
<template>
    <div
        class="relative flex w-full flex-row gap-5"
        :class="approvalState === 'pending' ?
            'ps-3 before:absolute before:inset-y-0 before:start-0 before:w-[3px] before:rounded-full before:bg-warning-600 before:content-[\'\']' :
            ''"
    >
        <div class="flex min-w-0 flex-1 flex-col gap-2">
            <div class="flex flex-row items-center gap-1.5 text-xs text-fg-muted">
                <VCIcon
                    name="fa6-solid:globe"
                    class="text-[0.7rem]"
                />
                <ARealm :query-filters="{ id: entity.projectRealmId }">
                    <template #default="scope">
                        <b
                            v-if="scope && scope.data"
                            class="text-fg"
                        >{{ scope.data.name }}</b>
                        <b
                            v-else
                            class="text-fg"
                        >{{ entity.projectRealmId }}</b>
                    </template>
                </ARealm>
                invites your node
                <b class="text-fg">{{ entity.node?.name ?? entity.nodeId }}</b>
                <span
                    v-if="isAggregator"
                    class="rounded border border-current px-1 text-[0.58rem] font-bold tracking-wider"
                >AGG</span>
            </div>

            <div class="flex flex-row items-center gap-2.5">
                <span class="entity-icon h-8 w-8 flex-none text-[0.9rem]">
                    <VCIcon name="fa6-solid:diagram-project" />
                </span>
                <VCLink
                    :to="'/projects/' + entity.projectId"
                    class="truncate text-[0.95rem] font-bold"
                >
                    <FDisplayName
                        :name="entity.project?.name ?? entity.projectId"
                        :display-name="entity.project?.displayName"
                    />
                </VCLink>
                <span
                    v-if="entity.project"
                    class="rounded-full border border-border bg-bg px-2 font-mono text-[0.68rem] text-fg-muted"
                >{{ entity.project.name }}</span>
            </div>

            <p
                v-if="entity.project?.description"
                class="m-0 line-clamp-3 text-[0.8rem] text-fg-muted"
            >
                {{ entity.project.description }}
            </p>

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

            <div
                v-if="entity.project"
                class="mt-auto flex flex-wrap items-center gap-1.5 text-xs text-fg-muted"
            >
                <span class="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-0.5 text-[0.72rem]">
                    <VCIcon
                        name="fa6-solid:server"
                        class="text-[0.66rem]"
                    />
                    joins <b class="text-fg">{{ entity.project.nodes }}</b> {{ entity.project.nodes === 1 ? 'node' : 'nodes' }}
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-0.5 text-[0.72rem]">
                    <VCIcon
                        name="fa6-solid:microscope"
                        class="text-[0.66rem]"
                    />
                    <b class="text-fg">{{ entity.project.analyses }}</b> {{ entity.project.analyses === 1 ? 'analysis' : 'analyses' }}
                </span>
                <span
                    v-if="masterImage"
                    class="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-0.5 font-mono text-[0.68rem]"
                >
                    <VCIcon
                        name="fa6-solid:cube"
                        class="text-[0.62rem]"
                    />
                    {{ masterImage.virtualPath }}
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-0.5 text-[0.72rem]">
                    <VCIcon
                        name="fa6-solid:calendar"
                        class="text-[0.66rem]"
                    />
                    project since <VCTimeago :datetime="entity.project.createdAt" />
                </span>
            </div>
        </div>

        <div class="flex w-40 flex-none flex-col gap-2 border-s border-border ps-4">
            <span
                class="self-start rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wide"
                :class="{
                    'bg-warning-600/15 text-warning-600': approvalState === 'pending',
                    'bg-success-600/15 text-success-600': approvalState === 'approved',
                    'bg-error-600/15 text-error-600': approvalState === 'rejected',
                }"
            >
                {{ approvalState }}
            </span>

            <slot
                name="itemActions"
                :data="entity"
            >
                <div class="flex flex-col gap-1.5">
                    <FProjectNodeApprovalCommand
                        :entity-id="entity.id"
                        :approval-status="entity.approvalStatus"
                        :with-icon="true"
                        :element-type="'button'"
                        :command="'approve'"
                        @updated="handleUpdated"
                    />
                    <FProjectNodeApprovalCommand
                        :entity-id="entity.id"
                        :approval-status="entity.approvalStatus"
                        :with-icon="true"
                        :element-type="'button'"
                        :command="'reject'"
                        @updated="handleUpdated"
                    />
                </div>
                <div class="flex flex-row gap-1.5">
                    <VCButton
                        size="xs"
                        color="primary"
                        @click.prevent="toggleModal"
                    >
                        <VCIcon name="fa6-solid:comment" />
                    </VCButton>
                    <VCButton
                        :as="VCLink"
                        :to="'/projects/' + entity.projectId"
                        :disabled="busy"
                        size="xs"
                        color="neutral"
                    >
                        <VCIcon name="fa6-solid:bars" />
                    </VCButton>
                </div>
            </slot>

            <span class="mt-auto text-[0.72rem] leading-relaxed text-fg-muted">
                <VCIcon
                    name="fa6-solid:clock"
                    class="me-1 text-[0.66rem]"
                />
                requested <VCTimeago :datetime="entity.createdAt" />
                <template v-if="approvalState !== 'pending'">
                    <br>{{ approvalState }} <VCTimeago :datetime="entity.updatedAt" />
                </template>
            </span>
        </div>

        <VCModal v-model:open="modal">
            <!-- attrs forward to reka-ui DialogContent: preventing
                 escapeKeyDown / interactOutside restores the pre-migration
                 no-close-on-esc / no-close-on-backdrop guards (the form
                 inside holds in-progress approval input). -->
            <VCModalContent
                class="modal-lg"
                @escape-key-down="(event: Event) => event.preventDefault()"
                @interact-outside="(event: Event) => event.preventDefault()"
            >
                <div class="modal-header">
                    <VCModalTitle class="modal-title">
                        <VCIcon name="fa6-solid:file-import" /> Project
                        <FDisplayName
                            :name="entity.project.name"
                            :display-name="entity.project.displayName"
                        />
                    </VCModalTitle>
                    <VCModalClose class="btn-close" />
                </div>
                <div class="modal-body">
                    <template v-if="entity">
                        <FProjectInForm
                            :entity="entity"
                            @updated="handleUpdated"
                            @failed="handleFailed"
                        />
                    </template>
                    <template v-else>
                        ...
                    </template>
                </div>
            </VCModalContent>
        </VCModal>
    </div>
</template>
