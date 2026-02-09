<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { AnalysisBucket, AnalysisBucketType } from '@privateaim/core-kit';
import { AnalysisCommand } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import {
    defineComponent, ref, useTemplateRef,
} from 'vue';
import { type EntityManagerResolveContext, injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';
import FAnalysisBucket from './FAnalysisBucket';

export default defineComponent({
    components: { FAnalysisBucket },
    props: {
        entityId: {
            type: String,
            required: true,
        },
        type: {
            type: String as PropType<`${AnalysisBucketType}`>,
        },
    },
    emits: ['updated', 'executed', 'failed'],
    setup(props, { emit }) {
        const vNode = useTemplateRef<typeof FAnalysisBucket>('analysisBucket');
        const httpClient = injectCoreHTTPClient();

        const forward = (name: string, ...args: unknown[]) => {
            emit(name as 'updated' | 'executed', ...args);
        };

        const isBusy = ref(false);

        const execute = wrapFnWithBusyState(isBusy, async () => {
            try {
                const response = await httpClient
                    .analysis.runCommand(props.entityId, AnalysisCommand.STORAGE_CHECK);

                emit('executed', AnalysisCommand.STORAGE_CHECK);
                emit('updated', response);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        const refresh = () => {
            if (vNode.value) {
                vNode.value.resolve({
                    reset: true,
                } satisfies EntityManagerResolveContext<AnalysisBucket>);
            }
        };

        const retry = () => {
            Promise.resolve()
                .then(() => execute())
                .then(() => refresh());
        };

        return {
            forward,
            refresh,
            retry,
        };
    },
});

</script>
<template>
    <!-- v-bind="$props" -->
    <FAnalysisBucket
        ref="analysisBucket"
        :query-filters="{
            analysis_id: entityId,
            type,
        }"
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
