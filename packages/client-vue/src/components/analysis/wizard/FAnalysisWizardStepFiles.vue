<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { AnalysisBucketType } from '@privateaim/core-kit';
import type { Analysis, AnalysisBucket, AnalysisBucketFile } from '@privateaim/core-kit';
import type { FiltersBuildInput } from 'rapiq';
import {
    type PropType, computed, defineComponent, ref,
} from 'vue';
import FAnalysisBucketFileManager from '../../analysis-bucket-file/FAnalysisBucketFileManager.vue';
import FAnalysisBucket from '../../analysis-bucket/FAnalysisBucket';
import FAnalysisImageCommand from '../FAnalysisImageCommand';

export default defineComponent({
    components: {
        FAnalysisBucketFileManager,
        FAnalysisImageCommand,
        FAnalysisBucket,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        entrypointEntity: {
            type: Object as PropType<AnalysisBucketFile>,
        },
    },
    emits: ['failed', 'entrypointChanged'],
    setup(props, { emit }) {
        const analysisBucketNode = ref<typeof FAnalysisBucket | null>(null);
        const queryFilters = computed(() => ({
            analysis_id: props.entity.id,
            type: AnalysisBucketType.CODE,
        } satisfies FiltersBuildInput<AnalysisBucket>));

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const handleEntrypointChanged = (e: AnalysisBucketFile) => {
            emit('entrypointChanged', e);
        };

        const retry = () => {
            if (analysisBucketNode.value) {
                analysisBucketNode.value.resolve({ reset: true });
            }
        };

        return {
            handleFailed,
            handleEntrypointChanged,
            queryFilters,

            analysisBucketNode,
            retry,
        };
    },
});
</script>
<template>
    <div>
        <FAnalysisBucket
            ref="analysisBucketNode"
            :query-filters="queryFilters"
        >
            <template #default="{ data: bucket }">
                <span>Entrypoint Command</span>
                <br>
                <FAnalysisImageCommand
                    class="mt-2 mb-2"
                    :master-image-id="entity.master_image_id"
                    :analysis-file="entrypointEntity"
                    :analysis-id="entity.id"
                />

                <FAnalysisBucketFileManager
                    :entity="bucket"
                    :file-entity="entrypointEntity"
                    @set-entrypoint-file="handleEntrypointChanged"
                    @failed="handleFailed"
                />
            </template>
            <template #error>
                <div class="alert alert-sm alert-warning">
                    <p>
                        The code bucket does not exist. Therefore, no files can be uploaded.
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
    </div>
</template>
