<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCLink } from '@vuecs/link';
import { BModal } from 'bootstrap-vue-next';
import type { ProjectNode } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { FProjectInForm } from '../project/FProjectInForm';
import { FProjectNodeApprovalCommand } from './FProjectNodeApprovalCommand';
import { FProjectNodeApprovalStatus } from './FProjectNodeApprovalStatus';

export default defineComponent({
    components: {
        BModal,
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
    <div class="d-flex flex-column gap-1 w-100">
        <div class="w-100">
            <div class="d-flex flex-row align-items-center">
                <div>
                    <slot
                        name="title"
                        :data="entity"
                    >
                        <i class="fas fa-project-diagram me-1" />
                        <VCLink
                            :to="'/projects/' + entity.project.id"
                            class="mb-0"
                        >
                            {{ entity.project.name }}
                        </VCLink>
                    </slot>
                </div>
                <div class="ms-auto d-flex flex-row gap-1">
                    <slot
                        name="itemActions"
                        :data="entity"
                    >
                        <VCLink
                            :to="'/projects/' + entity.project.id"
                            :disabled="busy"
                            class="btn btn-xs btn-dark"
                        >
                            <i class="fa fa-bars" />
                        </VCLink>
                        <button
                            type="button"
                            class="btn btn-xs btn-primary"
                            @click.prevent="toggleModal"
                        >
                            <i class="fa fa-comment-alt" />
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
                <div class="col-12 col-md-4 d-flex align-items-center flex-column">
                    <div>
                        <strong><i class="fa-solid fa-server" /> Node</strong>
                    </div>
                    <div>
                        {{ entity.node.name }}
                    </div>
                </div>
                <div class="col-12 col-md-4 d-flex align-items-center flex-column">
                    <div>
                        <strong><i class="fa-solid fa-heartbeat" /> Status</strong>
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
                <div class="col-12 col-md-4 d-flex align-items-center flex-column">
                    <div>
                        <strong><i class="fa-solid fa-user" /> Creator</strong>
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
                <div class="d-flex flex-grow-1 align-items-center flex-column">
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
            <div class="d-flex flex-row">
                <div class="">
                    <small>
                        <span class="text-muted">
                            created
                        </span>
                        <VCTimeago :datetime="entity.created_at" />
                    </small>
                </div>
                <div class="ms-auto">
                    <small>
                        <span class="text-muted">
                            updated
                        </span>
                        <VCTimeago :datetime="entity.updated_at" />
                    </small>
                </div>
            </div>
        </slot>

        <BModal
            v-model="modal"
            size="lg"
            button-size="sm"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <template #title>
                <i class="fas fa-file-import" /> Project {{ entity.project.name }}
            </template>
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
        </BModal>
    </div>
</template>
