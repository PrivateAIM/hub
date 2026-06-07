<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCLink } from '@vuecs/link';
import type { ProjectNode } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import FDisplayName from '../FDisplayName';
import { FProjectInForm } from '../project/FProjectInForm';
import { FProjectNodeApprovalCommand } from './FProjectNodeApprovalCommand';
import { FProjectNodeApprovalStatus } from './FProjectNodeApprovalStatus';

export default defineComponent({
    components: {
        FDisplayName,
        FProjectInForm,
        FProjectNodeApprovalCommand,
        FProjectNodeApprovalStatus,
        VCLink,
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
    setup(_props, { emit }) {
        const modal = ref<boolean>(false);
        const toggleModal = () => {
            modal.value = !modal.value;
        };

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
            modal,
            toggleModal,

            handleDeleted,
            handleFailed,
            handleUpdated,
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
                            name="fa6-solid:diagram-project"
                            class="me-1"
                        />
                        <VCLink
                            :to="'/projects/' + entity.project.id"
                            class="mb-0"
                        >
                            <FDisplayName
                                :name="entity.project.name"
                                :display-name="entity.project.display_name"
                            />
                        </VCLink>
                    </slot>
                </div>
                <div class="ms-auto flex flex-row gap-1">
                    <slot
                        name="itemActions"
                        :data="entity"
                    >
                        <VCLink
                            :to="'/projects/' + entity.project.id"
                            :disabled="busy"
                            class="btn btn-xs btn-dark"
                        >
                            <VCIcon name="fa6-solid:bars" />
                        </VCLink>
                        <button
                            type="button"
                            class="btn btn-xs btn-primary"
                            @click.prevent="toggleModal"
                        >
                            <VCIcon name="fa6-solid:comment" />
                        </button>
                        <FProjectNodeApprovalCommand
                            :entity-id="entity.id"
                            :approval-status="entity.approval_status"
                            :with-icon="true"
                            :element-type="'button'"
                            :command="'approve'"
                            :with-text="false"
                            @updated="handleUpdated"
                        />
                        <FProjectNodeApprovalCommand
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
            <div class="row">
                <div class="col-12 col-md-4 flex items-center flex-col">
                    <div>
                        <strong><VCIcon name="fa6-solid:server" /> Node</strong>
                    </div>
                    <div>
                        {{ entity.node.name }}
                    </div>
                </div>
                <div class="col-12 col-md-4 flex items-center flex-col">
                    <div>
                        <strong><VCIcon name="fa6-solid:heart-pulse" /> Status</strong>
                    </div>
                    <div>
                        <FProjectNodeApprovalStatus
                            :status="entity.approval_status"
                        >
                            <template #default="slotProps">
                                <span
                                    :class="'text-'+slotProps.classSuffix"
                                >
                                    {{ slotProps.statusText }}
                                </span>
                            </template>
                        </FProjectNodeApprovalStatus>
                    </div>
                </div>
                <div class="col-12 col-md-4 flex items-center flex-col">
                    <div>
                        <strong><VCIcon name="fa6-solid:user" /> Creator</strong>
                    </div>
                    <div>
                        <template v-if="entity.project.user_id">
                            {{ entity.project.user_id }}
                        </template>
                        <template v-else-if="entity.project.robot_id">
                            {{ entity.project.robot_id }}
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

        <VCModal v-model:open="modal">
            <VCModalContent class="modal-lg">
                <div class="modal-header">
                    <VCModalTitle class="modal-title">
                        <VCIcon name="fa6-solid:file-import" /> Project
                        <FDisplayName
                            :name="entity.project.name"
                            :display-name="entity.project.display_name"
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
