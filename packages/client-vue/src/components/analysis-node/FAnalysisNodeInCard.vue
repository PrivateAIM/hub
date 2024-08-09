<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCLink } from '@vuecs/link';
import type { AnalysisNode } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { injectCoreHTTPClient } from '../../core';
import FAnalysisName from '../analysis/FAnalysisName';
import { FAnalysisNodeApprovalCommand } from './FAnalsisNodeApprovalCommand';
import { FAnalysisNodeApprovalStatus } from './FAnalysisNodeApprovalStatus';

export default defineComponent({
    components: {
        FAnalysisName,
        FAnalysisNodeApprovalCommand,
        FAnalysisNodeApprovalStatus,
        VCLink,
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
        const api = injectCoreHTTPClient();

        const download = () => {
            window.open(api.analysis.getFileDownloadURL(props.entity.analysis_id), '_blank');
        };

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
            download,

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
                        <i class="fas fa-microscope me-1" />

                        <FAnalysisName
                            :entity-id="entity.analysis.id"
                            :entity-name="entity.analysis.name"
                        />
                    </slot>
                </div>
                <div class="ms-auto d-flex flex-row gap-1">
                    <slot
                        name="itemActions"
                        :data="entity"
                    >
                        <VCLink
                            :to="'/analyses/' + entity.analysis.id"
                            :disabled="busy"
                            class="btn btn-xs btn-dark"
                        >
                            <i class="fa fa-bars" />
                        </VCLink>
                        <button
                            type="button"
                            class="btn btn-dark btn-xs me-1"
                            @click.prevent="download()"
                        >
                            <i class="fa fa-file-download" />
                        </button>
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
                        <FAnalysisNodeApprovalStatus
                            :status="entity.approval_status"
                        >
                            <template #default="slotProps">
                                <span
                                    :class="'text-'+slotProps.classSuffix"
                                >
                                    {{ slotProps.statusText }}
                                </span>
                            </template>
                        </FAnalysisNodeApprovalStatus>
                    </div>
                </div>
                <div class="col-12 col-md-4 d-flex align-items-center flex-column">
                    <div>
                        <strong><i class="fa-solid fa-user" /> Creator</strong>
                    </div>
                    <div>
                        <template v-if="entity.analysis.user_id">
                            {{ entity.analysis.user_id }}
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
    </div>
</template>
