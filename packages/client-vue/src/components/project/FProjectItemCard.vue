<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { useAbilityCheck } from '@authup/client-web-kit';
import type { Project } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { VCLink } from '@vuecs/link';
import { VCTimeago } from '@vuecs/timeago';
import type { PropType, SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { EntityListSlotName } from '../../core';
import FEntityDelete from '../FEntityDelete';

export default defineComponent({
    components: {
        FEntityDelete,
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
    setup(_props, { emit }) {
        const canDelete = useAbilityCheck(PermissionName.PROJECT_DELETE);

        const handleDeleted = (data: Project) => {
            emit('deleted', data);
        };

        return {
            canDelete,
            handleDeleted,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column w-100">
        <div class="p-1 w-100">
            <div class="d-flex flex-row align-items-center">
                <div class="me-1">
                    <i class="fas fa-project-diagram" />
                </div>
                <div>
                    <VCLink
                        :to="'/projects/' + entity.id"
                        class="mb-0"
                    >
                        {{ entity.name }}
                    </VCLink>
                </div>
                <div class="ms-auto">
                    <slot
                        name="itemActions"
                        :data="entity"
                    >
                        <VCLink
                            :to="'/projects/' + entity.id"
                            :disabled="busy"
                            class="btn btn-xs btn-dark"
                        >
                            <i class="fa fa-bars" />
                        </VCLink>
                        <template v-if="canDelete">
                            <FEntityDelete
                                :with-text="false"
                                :entity-id="entity.id"
                                :entity-type="'project'"
                                :disabled="busy || entity.analyses > 0"
                                class="btn btn-xs btn-danger ms-1"
                                @deleted="handleDeleted"
                            />
                        </template>
                    </slot>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between flex-row">
            <div class="d-flex flex-grow-1 align-items-center flex-column">
                <div>
                    <strong><i class="fa fa-microscope" /> Analyses</strong>
                </div>
                <div
                    class="h6"
                    :class="{'text-success': entity.analyses > 0, 'text-muted': entity.analyses === 0}"
                >
                    {{ entity.analyses }}
                </div>
            </div>
            <div class="d-flex flex-grow-1 align-items-center flex-column">
                <div>
                    <strong><i class="fa-solid fa-server" /> Nodes</strong>
                </div>
                <div
                    class="h6"
                    :class="{'text-success': entity.nodes > 0, 'text-muted': entity.nodes === 0}"
                >
                    {{ entity.nodes }}
                </div>
            </div>
            <div class="d-flex flex-grow-1 align-items-center flex-column">
                <div>
                    <strong><i class="fa-solid fa-user" /> Creator</strong>
                </div>
                <div class="h6">
                    <template v-if="entity.user_id">
                        {{ entity.user_id }}
                    </template>
                    <template v-else-if="entity.robot_id">
                        {{ entity.robot_id }}
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
