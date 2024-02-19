<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Registry } from '@privateaim/core';
import type { PropType } from 'vue';
import { RegistryCleanup, RegistrySetup } from '@privateaim/client-vue';
import { useToast } from '#imports';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { RegistryCleanup, RegistrySetup },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            required: true,
        },
    },
    async setup() {
        const toast = useToast();
        const handleExecuted = () => {
            if (toast) {
                toast.show({ variant: 'success', body: 'You successfully executed the setup routine.' });
            }
        };

        const handleFailed = (e: Error) => {
            if (toast) {
                toast.show({ variant: 'danger', body: e.message });
            }
        };

        return {
            handleFailed,
            handleExecuted,
        };
    },
});
</script>
<template>
    <div>
        <RegistrySetup
            :entity-id="entity.id"
            @executed="handleExecuted"
            @failed="handleFailed"
        />
    </div>
</template>
