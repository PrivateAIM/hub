<!--
  - Copyright (c) 2022-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Node } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { FNodeCrypto } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';
import { useToast } from '../../../../composables/toast';

export default defineNuxtComponent({
    components: { FNodeCrypto },
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: ['failed', 'updated'],
    methods: {
        handleFailed(e: Error) {
            this.$emit('failed', e);
        },
    },
    setup(props, { emit }) {
        const toast = useToast();

        const handleKeyCopied = () => {
            toast.show({
                variant: 'dark',
                body: 'The key was successfully copied to the clipboard.',
            });
        };

        const handleKeyPairGenerated = () => {
            toast.show({
                variant: 'dark',
                body: 'A key pair was successfully generated.',
            });
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const handleUpdated = (entity: Node) => {
            emit('updated', entity);
        };

        return {
            handleKeyCopied,
            handleKeyPairGenerated,
            handleFailed,
            handleUpdated,
        };
    },
});
</script>
<template>
    <FNodeCrypto
        v-if="entity"
        :entity="entity"
        :realm-id="entity.realm_id"
        @keyCopied="handleKeyCopied"
        @keyPairGenerated="handleKeyPairGenerated"
        @failed="handleFailed"
        @updated="handleUpdated"
    />
</template>
