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
import FAnalysis from '../FAnalysis';

export default defineComponent({
    components: { FAnalysis },
    props: {
        entityId: {
            type: String,
            required: true,
        },
        entity: {
            type: Object as PropType<Analysis>,
        },
        tag: {
            type: String,
            default: 'span',
        },
    },
});
</script>
<template>
    <FAnalysis
        :entity-id="entityId"
        :entity="entity"
    >
        <template #default="{ data, busy }">
            <template v-if="busy">
                <slot
                    name="unresolved"
                />
            </template>
            <template v-else>
                <template v-if="data.master_image_id">
                    <slot
                        name="valid"
                    />
                </template>
                <template v-else>
                    <slot
                        name="invalid"
                        v-bind="{ message: 'A master image bust be selected.' }"
                    />
                </template>
            </template>
        </template>
    </FAnalysis>
</template>
