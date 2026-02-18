<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisError } from '@privateaim/core-kit';
import { extractErrorMessage } from '@privateaim/kit';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        tag: {
            type: String,
            default: 'span',
        },
    },
    setup(props) {
        const passed = computed(() => props.entity.configuration_entrypoint_valid);
        const message = computed(() => {
            if (passed.value) {
                return null;
            }

            return extractErrorMessage(AnalysisError.entrypointRequired());
        });

        return {
            passed,
            message,
        };
    },
});
</script>
<template>
    <slot
        name="default"
        v-bind="{ passed, message }"
    />
</template>
