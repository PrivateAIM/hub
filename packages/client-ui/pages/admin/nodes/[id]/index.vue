<!--
  - Copyright (c) 2022-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Node } from '@privateaim/core';
import type { PropType } from 'vue';
import { FNodeForm } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { FNodeForm },
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: ['failed', 'updated'],
    methods: {
        handleUpdated(e: Node) {
            this.$emit('updated', e);
        },
        handleFailed(e: Error) {
            this.$emit('failed', e);
        },
    },
});
</script>
<template>
    <FNodeForm
        v-if="entity"
        :entity="entity"
        :realm-id="entity.realm_id"
        @updated="handleUpdated"
        @failed="handleFailed"
    />
</template>
