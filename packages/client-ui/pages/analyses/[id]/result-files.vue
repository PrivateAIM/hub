<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { FAnalysisTypeBucket, FBucketFilesManager } from '@privateaim/client-vue';
import type { PropType } from 'vue';
import { type Analysis } from '@privateaim/core-kit';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { FAnalysisTypeBucket, FBucketFilesManager },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'failed'],
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
                <FAnalysisTypeBucket
                    :entity-id="entity.id"
                    :type="'RESULT'"
                >
                    <template #default="props">
                        <FBucketFilesManager
                            ref="bucketFiles"
                            :entity-id="props.data.bucket_id"
                            :readonly="true"
                        />
                    </template>
                </FAnalysisTypeBucket>
            </div>
        </div>
    </div>
</template>
