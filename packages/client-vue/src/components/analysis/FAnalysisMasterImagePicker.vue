<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Analysis, MasterImage } from '@privateaim/core-kit';
import { defineEntityManagerEvents } from '../../core';
import { FMasterImagePicker } from '../master-image';
import FAnalysis from './FAnalysis';

export default defineComponent({
    components: {
        FMasterImagePicker,
        FAnalysis,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
        },
        entityId: {
            type: String as PropType<string>,
        },
        masterImageEntity: {
            type: Object as PropType<MasterImage>,
        },
        masterImageEntityId: {
            type: String,
        },
        readonly: {
            type: Boolean,
        },
    },
    emits: {
        ...defineEntityManagerEvents<Analysis>(),
    },
});
</script>
<template>
    <FAnalysis
        :entity="entity"
        :entity-id="entityId"
        @updated="(value) => $emit('updated', value)"
        @deleted="(value) => $emit('deleted', value)"
        @failed="(value) => $emit('failed', value)"
    >
        <template #default="{ data, update, busy, updated }">
            <template v-if="data">
                <FMasterImagePicker
                    :readonly="readonly || busy"
                    :entity-id="data.master_image_id"
                    :entity="data.master_image"
                    @resolved="(value) => {
                        if(
                            (value && value.id !== data.master_image_id) ||
                            !value && data.master_image_id ||
                            value && !data.master_image_id
                        ) {
                            update({
                                master_image_id: value ? value.id : null,
                                master_image: value,
                                image_command_arguments: null
                            })
                        } else {
                            updated({
                                ...data,
                                master_image_id: value ? value.id : null,
                                master_image: value
                            })
                        }
                    }"
                />
            </template>
        </template>
    </FAnalysis>
</template>
