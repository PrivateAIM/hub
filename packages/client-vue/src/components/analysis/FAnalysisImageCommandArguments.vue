<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import FImageCommandArguments from '../image/FImageCommandArguments.vue';
import { defineEntityManagerEvents } from '../../core';
import FAnalysis from './FAnalysis';

export default defineComponent({
    components: {
        FImageCommandArguments, FAnalysis,
    },
    props: {
        entityId: {
            type: String,
        },
        entity: {
            type: Object as PropType<Analysis>,
        },
        readonly: {
            type: Boolean,
            default: false,
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
        <template #default="{ data, update, busy }">
            <template v-if="data">
                <FImageCommandArguments
                    :items="data.image_command_arguments || data.master_image?.command_arguments"
                    :readonly="readonly || busy"

                    @submit="(value) => {
                        update({
                            image_command_arguments: value
                        })
                    }"
                />
            </template>
        </template>
    </FAnalysis>
</template>
