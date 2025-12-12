<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { FAnalysisTypeBucket, FBucketFilesManager } from '@privateaim/client-vue';
import type { Analysis } from '@privateaim/core-kit';
import { type PropType, useTemplateRef } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
    components: { FBucketFilesManager, FAnalysisTypeBucket },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
        },
    },
    setup() {
        const analysisCodeFiles = useTemplateRef<
        typeof FBucketFilesManager | null
        >('bucketFiles');

        const add = () => {
            if (analysisCodeFiles.value) {
                analysisCodeFiles.value.add();
            }
        };

        return {
            add,
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
                        <span class="title">Code</span>
                    </div>
                    <template v-if="!entity.configuration_locked">
                        <div class="ms-auto">
                            <button
                                style="width: 120px"
                                type="button"
                                class="btn btn-primary btn-xs"
                                @click.prevent="add"
                            >
                                <i class="fa fa-plus me-1" /> Add
                            </button>
                        </div>
                    </template>
                </div>
            </div>
            <div class="card-body">
                <div
                    class="d-flex flex-row gap-2 align-items-center alert alert-sm alert-warning"
                >
                    <div>
                        <i class="fa fa-upload" />
                    </div>
                    <div>
                        Upload one or more code files that define the logic of your analysis.
                        These files will later be packaged and distributed as part of the analysis image.
                    </div>
                </div>

                <FAnalysisTypeBucket
                    :entity-id="entity.id"
                    :type="'CODE'"
                >
                    <template #default="props">
                        <FBucketFilesManager
                            ref="bucketFiles"
                            :entity-id="props.data.bucket_id"
                            :readonly="entity.configuration_locked"
                        />
                    </template>
                </FAnalysisTypeBucket>
            </div>
        </div>
    </div>
</template>
