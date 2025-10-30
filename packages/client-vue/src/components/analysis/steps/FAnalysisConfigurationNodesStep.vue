<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import type { AnalysisNode } from '@privateaim/core-kit';
import { NodeType } from '@privateaim/core-kit';
import { injectCoreHTTPClient } from '../../../core';

export default defineComponent({
    props: {
        entityId: {
            type: String,
            required: true,
        },
        tag: {
            type: String,
            default: 'span',
        },
    },
    setup(props) {
        const httpClient = injectCoreHTTPClient();

        const resolved = ref(false);
        const busy = ref(false);

        const nodes = ref<AnalysisNode[]>([]);
        const hasDefault = computed(() => nodes.value
            .filter((analysisNode) => analysisNode.node.type === NodeType.DEFAULT)
            .length > 0);
        const hasAggregator = computed(() => nodes.value
            .filter((analysisNode) => analysisNode.node.type === NodeType.AGGREGATOR)
            .length > 0);

        const message = computed(() => {
            if (busy.value || !resolved.value) {
                return null;
            }

            if (!hasDefault.value) {
                return 'One or more default nodes must be selected.';
            }

            if (!hasAggregator.value) {
                return 'An aggregator node must be selected.';
            }

            return null;
        });

        const passed = computed(() => !busy.value && hasDefault.value && hasAggregator.value);

        const resolve = async () => {
            if (busy.value) return;

            busy.value = true;

            try {
                const { data } = await httpClient.analysisNode.getMany({
                    filters: {
                        analysis_id: props.entityId,
                    },
                    relations: {
                        node: true,
                    },
                });

                nodes.value = data;
                // todo: get all nodes + check if a aggregator node is one of them
            } finally {
                resolved.value = true;
                busy.value = false;
            }
        };

        Promise
            .resolve()
            .then(() => resolve());

        return {
            busy,
            passed,
            message,
            hasDefault,
            hasAggregator,
            resolved,
        };
    },
});
</script>
<template>
    <slot
        name="default"
        v-bind="{ resolved, passed, message, hasDefault, hasAggregator }"
    >
        <component :is="tag">
            <template v-if="!resolved">
                <slot
                    name="unresolved"
                    v-bind="{ busy, passed, message, hasDefault, hasAggregator }"
                />
            </template>
            <template v-else>
                <template v-if="passed">
                    <slot
                        name="valid"
                        v-bind="{ busy, passed, message, hasDefault, hasAggregator }"
                    />
                </template>
                <template v-else>
                    <slot
                        name="invalid"
                        v-bind="{ busy, passed, message, hasDefault, hasAggregator }"
                    />
                </template>
            </template>
        </component>
    </slot>
</template>
