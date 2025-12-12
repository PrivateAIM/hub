<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { AnalysisBucketType } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent, useTemplateRef } from 'vue';
import FAnalysisBucket from './FAnalysisBucket';

export default defineComponent({
    components: { FAnalysisBucket },
    props: {
        entityId: {
            type: String,
        },
        type: {
            type: String as PropType<`${AnalysisBucketType}`>,
        },
    },
    setup(_, { emit }) {
        const vNode = useTemplateRef<typeof FAnalysisBucket>('analysisBucket');

        const forward = (name: string, ...args: unknown[]) => {
            emit(name, ...args);
        };

        const retry = () => {
            if (vNode.value) {
                vNode.value.resolve({ reset: true });
            }
        };

        return {
            forward,
            retry,
        };
    },
});

</script>
<template>
    <FAnalysisBucket
        ref="analysisBucket"
        :query-filters="{
            analysis_id: entityId,
            type,
        }"
        v-bind="$props"
        v-on="forward"
    >
        <template #default="props">
            <slot
                name="default"
                v-bind="props"
            />
        </template>
        <template #error>
            <div class="alert alert-sm alert-warning">
                <p>
                    The {{ type }} bucket does not exist.
                </p>

                <button
                    type="button"
                    class="btn btn-xs btn-dark"
                    @click.prevent="retry"
                >
                    <i class="fas fa-rotate-right" /> Retry
                </button>
            </div>
        </template>
    </FAnalysisBucket>
</template>
