<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Registry } from '@privateaim/core-kit';
import { RegistryForm } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { RegistryForm },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            required: true,
        },
    },
    emits: ['updated', 'deleted', 'failed'],
    setup(props, { emit }) {
        const handleUpdated = (e: Registry) => {
            emit('updated', e);
        };

        const handleDeleted = (e: Registry) => {
            emit('deleted', e);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            handleUpdated,
            handleDeleted,
            handleFailed,
        };
    },
});
</script>
<template>
    <RegistryForm
        v-if="entity"
        :entity="entity"
        @updated="handleUpdated"
        @deleted="handleDeleted"
        @failed="handleFailed"
    />
</template>
