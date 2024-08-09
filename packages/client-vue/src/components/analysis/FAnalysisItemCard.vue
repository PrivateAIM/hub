<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { useAbilityCheck } from '@authup/client-web-kit';
import type { Analysis } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { VCLink } from '@vuecs/link';
import { VCTimeago } from '@vuecs/timeago';
import type { PropType, SlotsType } from 'vue';
import { defineComponent, ref } from 'vue';
import type { EntityListSlotName } from '../../core';
import FAnalysisNodesProgress from '../analysis-node/FAnalysisNodesProgress.vue';
import FEntityDelete from '../FEntityDelete';
import FAnalysisName from './FAnalysisName';
import FAnalysisPipeline from './FAnalysisPipeline.vue';

export default defineComponent({
    components: {
        FAnalysisNodesProgress,
        FAnalysisPipeline,
        FAnalysisName,
        FEntityDelete,
        VCLink,
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
    setup(_props, { emit }) {
        const extendedView = ref(false);
        const toggleView = () => {
            extendedView.value = !extendedView.value;
        };

        const canDelete = useAbilityCheck(PermissionName.ANALYSIS_DELETE);

        const handleDeleted = (data: Analysis) => {
            emit('deleted', data);
        };

        const handleExecuted = (component: string, command: string) => {
            emit('executed', component, command);
        };

        const handleFailed = (error: Error) => {
            emit('failed', error);
        };

        const handleUpdated = (data: Analysis) => {
            emit('updated', data);
        };

        return {
            extendedView,
            toggleView,

            canDelete,
            handleDeleted,
            handleExecuted,
            handleFailed,
            handleUpdated,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column w-100">
        <div>
            <div class="d-flex flex-row align-items-center">
                <div class="me-1">
                    <FAnalysisName
                        :entity-id="entity.id"
                        :entity-name="entity.name"
                        :editable="true"
                        @updated="handleUpdated"
                    >
                        <template #default="props">
                            <i class="fas fa-microscope me-1" />
                            <VCLink :to="'/analyses/' + props.entityId">
                                {{ props.nameDisplay }}
                            </VCLink>
                            <template v-if="props.entityName">
                                <span class="text-muted ms-1">
                                    {{ props.entityId }}
                                </span>
                            </template>
                        </template>
                    </FAnalysisName>
                </div>
                <div class="ms-auto">
                    <slot
                        name="itemActions"
                        :data="entity"
                    >
                        <button
                            class="btn btn-xs btn-dark"
                            @click.prevent="toggleView"
                        >
                            <i
                                :class="{
                                    'fa fa-chevron-down': !extendedView,
                                    'fa fa-chevron-up': extendedView}
                                "
                            />
                        </button>
                        <VCLink
                            :to="'/analyses/' + entity.id"
                            :disabled="busy"
                            class="btn btn-xs btn-dark ms-1"
                        >
                            <i class="fa fa-bars" />
                        </VCLink>
                        <template v-if="canDelete">
                            <FEntityDelete
                                :with-text="false"
                                :entity-id="entity.id"
                                :entity-type="'analysis'"
                                :disabled="busy"
                                class="btn btn-xs btn-danger ms-1"
                                @deleted="handleDeleted"
                            />
                        </template>
                    </slot>
                </div>
            </div>
        </div>
        <FAnalysisPipeline
            :entity="entity"
            :with-command="extendedView"
            :list-direction="extendedView ? 'column' : 'row'"
            @updated="handleUpdated"
            @deleted="handleDeleted"
            @executed="handleExecuted"
            @failed="handleFailed"
        />
        <FAnalysisNodesProgress
            class="mt-1 mb-1"
            :entity="entity"
            :element-type="'progress-bar'"
        />
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
    </div>
</template>
