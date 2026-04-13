<!--
  - Copyright (c) 2022-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Node } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { FNodeClient } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { FNodeClient },
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: ['failed', 'updated'],
    setup(props, { emit }) {
        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const handleUpdated = () => {
            emit('updated', props.entity);
        };

        return {
            handleFailed,
            handleUpdated,
        };
    },
});
</script>
<template>
    <FNodeClient
        v-if="entity"
        :entity="entity"
        :realm-id="entity.realm_id"
        @failed="handleFailed"
        @updated="handleUpdated"
    />
</template>
