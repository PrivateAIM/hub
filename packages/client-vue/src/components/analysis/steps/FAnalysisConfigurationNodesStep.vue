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
        const hasAggregator = computed(() => props.entity.configuration_node_aggregator_valid);
        const hasDefault = computed(() => props.entity.configuration_node_default_valid);
        const passed = computed(() => hasAggregator.value && hasDefault.value);

        const message = computed(() => {
            if (passed.value) {
                return null;
            }

            if (!hasDefault.value) {
                return extractErrorMessage(AnalysisError.defaultNodeRequired());
            }

            if (!hasAggregator.value) {
                return extractErrorMessage(AnalysisError.aggregatorNodeRequired());
            }

            return null;
        });

        return {
            passed,
            hasAggregator,
            hasDefault,
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
