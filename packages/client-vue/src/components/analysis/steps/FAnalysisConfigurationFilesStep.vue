<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import type { AnalysisBucketFile } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
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

        const files = ref<AnalysisBucketFile[]>([]);
        const hasEntrypoint = computed(() => files.value
            .filter((analysisBucketFile) => analysisBucketFile.root &&
                analysisBucketFile.bucket.type === AnalysisBucketType.CODE)
            .length > 0);

        const message = computed(() => {
            if (busy.value || !resolved.value) {
                return null;
            }

            if (!hasEntrypoint.value) {
                return 'An entrypoint file must be selected.';
            }

            return null;
        });

        const passed = computed(() => !busy.value && hasEntrypoint.value);

        const resolve = async () => {
            if (busy.value) return;

            busy.value = true;

            try {
                const { data } = await httpClient.analysisBucketFile.getMany({
                    filters: {
                        analysis_id: props.entityId,
                        root: true,
                    },
                    relations: {
                        bucket: true,
                    },
                });

                files.value = data;
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
            resolved,
            passed,
            message,
            hasEntrypoint,
        };
    },
});
</script>
<template>
    <slot
        name="default"
        v-bind="{ passed, message, hasEntrypoint }"
    >
        <component :is="tag">
            <template v-if="!resolved">
                <slot
                    name="unresolved"
                />
            </template>
            <template v-else>
                <template v-if="passed">
                    <slot
                        name="valid"
                    />
                </template>
                <template v-else>
                    <slot
                        name="invalid"
                        v-bind="{ message, hasEntrypoint }"
                    />
                </template>
            </template>
        </component>
    </slot>
</template>
