<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { FAnalysisBucket, FBucketFileManager } from '@privateaim/client-vue';
import { computed } from 'vue';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import { type Analysis, type AnalysisBucket, AnalysisBucketType } from '@privateaim/core-kit';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { FBucketFileManager, FAnalysisBucket },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'failed'],
    setup(props) {
        const query = computed<BuildInput<AnalysisBucket>>(() => ({
            filter: {
                type: AnalysisBucketType.RESULT,
                analysis_id: props.entity.id,
            },
        } satisfies BuildInput<AnalysisBucket>));

        return {
            query,
        };
    },
});
</script>
<template>
    <div v-if="entity">
        <div class="card-grey card mb-3">
            <div class="card-header">
                <div class="d-flex flex-row w-100">
                    <div>
                        <span class="title">Results</span>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <FAnalysisBucket :query="query">
                    <template #default="{ data: bucket }">
                        <FBucketFileManager
                            :readonly="true"
                            :entity-id="bucket.external_id"
                        />
                    </template>
                    <template #error>
                        <div class="alert alert-sm alert-warning">
                            The result storage for the analysis does not exist. Therefore, no files can be downloaded.
                        </div>
                    </template>
                </FAnalysisBucket>
            </div>
        </div>
    </div>
</template>
