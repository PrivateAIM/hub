<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { FAnalysisBucket, FAnalysisBucketFileDownload, FAnalysisBucketFiles } from '@privateaim/client-vue';
import { computed } from 'vue';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import { type Analysis, type AnalysisBucket, AnalysisBucketType } from '@privateaim/core';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { FAnalysisBucket, FAnalysisBucketFiles, FAnalysisFileDownload: FAnalysisBucketFileDownload },
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
    <div class="panel-box">
        <FAnalysisBucket :query="query">
            <template #default="{ data: bucket }">
                <FAnalysisBucketFiles
                    :query="{ filters: { bucket_id: bucket.id } }"
                >
                    <template #itemActions="{ data }">
                        <FAnalysisFileDownload
                            :entity="data"
                            :with-icon="true"
                        />
                    </template>
                </FAnalysisBucketFiles>
            </template>
            <template #error>
                <div class="alert alert-sm alert-warning">
                    The result bucket does not exist. Therefore, no files can be downloaded.
                </div>
            </template>
        </FAnalysisBucket>
    </div>
</template>
