<!--
  - Copyright (c) 2022-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Node } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { FNodeClientCredentials } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { FNodeClientCredentials },
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: ['failed'],
    setup(props, { emit }) {
        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return { handleFailed };
    },
});
</script>
<template>
    <FNodeClientCredentials
        v-if="entity"
        :entity="entity"
        @failed="handleFailed"
    />
</template>
