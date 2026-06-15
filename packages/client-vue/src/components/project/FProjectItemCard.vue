<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import type { Project } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { VCLink } from '@vuecs/link';
import { VCTimeago } from '@vuecs/timeago';
import type { PropType, SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { EntityListSlotName } from '../../core';
import FDisplayName from '../FDisplayName';
import FEntityDelete from '../FEntityDelete';
import FProjectCreator from './FProjectCreator.vue';

export default defineComponent({
    components: {
        FProjectCreator,
        FDisplayName,
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
        },
        header: {
            data: Project
        },
        body: {
            data: Project
        },
        footer: {
            data: Project
        },
    }>,
    setup(_props, { emit }) {
        const canDelete = usePermissionCheck({ name: PermissionName.PROJECT_DELETE });

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
    <div class="flex flex-col w-full">
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
                            :to="'/projects/' + entity.id"
                            class="mb-0"
                        >
                            <FDisplayName
                                :name="entity.name"
                                :display-name="entity.display_name"
                            />
                        </VCLink>
                    </slot>
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
                            <VCIcon name="fa6-solid:bars" />
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
        <slot
            name="body"
            :data="entity"
        >
            <div class="flex justify-between flex-row">
                <div class="flex grow items-center flex-col">
                    <div>
                        <strong><VCIcon name="fa6-solid:microscope" /> Analyses</strong>
                    </div>
                    <div
                        :class="{'text-success-600': entity.analyses > 0, 'text-fg-muted': entity.analyses === 0}"
                    >
                        {{ entity.analyses }}
                    </div>
                </div>
                <div class="flex grow items-center flex-col">
                    <div>
                        <strong><VCIcon name="fa6-solid:server" /> Nodes</strong>
                    </div>
                    <div
                        :class="{'text-success-600': entity.nodes > 0, 'text-fg-muted': entity.nodes === 0}"
                    >
                        {{ entity.nodes }}
                    </div>
                </div>
                <div class="flex grow items-center flex-col">
                    <div>
                        <strong><VCIcon name="fa6-solid:user" /> Creator</strong>
                    </div>
                    <div>
                        <FProjectCreator :entity="entity" />
                    </div>
                </div>
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
