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
    type PropType, computed, defineComponent, ref, useTemplateRef,
} from 'vue';
import FAnalysisBucketFileManager from '../analysis-bucket-file/FAnalysisBucketFileManager.vue';
import FAnalysisBucket from '../analysis-bucket/FAnalysisBucket';

export default defineComponent({
    components: {
        FAnalysisBucketFileManager,
        FAnalysisBucket,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['failed', 'updated'],
    setup(props, { emit, expose }) {
        const bucketFileManager = useTemplateRef<typeof FAnalysisBucketFileManager | null>('bucketFileManager');
        const analysisBucketNode = ref<typeof FAnalysisBucket | null>(null);

        const queryFilters = computed(() => ({
            analysis_id: props.entity.id,
            type: AnalysisBucketType.CODE,
        } satisfies FiltersBuildInput<AnalysisBucket>));

        const add = () => {
            if (props.entity.configuration_locked) {
                return;
            }

            if (bucketFileManager.value) {
                bucketFileManager.value.add();
            }
        };

        expose({
            add,
        });

        const handleUpdated = (entity: AnalysisBucketFile) => {
            emit('updated', entity);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const retry = () => {
            if (analysisBucketNode.value) {
                analysisBucketNode.value.resolve({ reset: true });
            }
        };

        return {
            add,

            handleUpdated,
            handleFailed,

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
                <FAnalysisBucketFileManager
                    ref="bucketFileManager"
                    :readonly="entity.configuration_locked || readonly"
                    :entity="bucket"
                    @failed="handleFailed"
                    @updated="handleUpdated"
                >
                    <template #itemActions="props">
                        <slot
                            name="itemActions"
                            v-bind="props"
                        />
                    </template>
                </FAnalysisBucketFileManager>
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
