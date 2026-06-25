<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { FAnalysisTypeBucket, FBucketFilesManager } from '@privateaim/client-vue';
import type { Analysis } from '@privateaim/core-kit';
import { VCButton } from '@vuecs/button';
import { VCAlert } from '@vuecs/elements';
import { VCIcon } from '@vuecs/icon';
import { type PropType, useTemplateRef } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
    components: {
        FBucketFilesManager, 
        FAnalysisTypeBucket, 
        VCButton, 
        VCAlert, 
        VCIcon, 
    },
    props: { entity: { type: Object as PropType<Analysis> } },
    setup() {
        const analysisCodeFiles = useTemplateRef<
        typeof FBucketFilesManager | null
        >('bucketFiles');

        const add = () => {
            if (analysisCodeFiles.value) {
                analysisCodeFiles.value.add();
            }
        };

        return { add };
    },
});
</script>
<template>
    <div v-if="entity">
        <div class="card-grey card mb-3">
            <div class="card-header">
                <div class="flex flex-row w-full">
                    <div>
                        <span class="title">Code</span>
                    </div>
                    <template v-if="!entity.configuration_locked">
                        <div class="ms-auto">
                            <VCButton
                                style="width: 120px"
                                color="primary"
                                size="xs"
                                @click.prevent="add"
                            >
                                <VCIcon
                                    name="fa6-solid:plus"
                                    class="me-1"
                                /> Add
                            </VCButton>
                        </div>
                    </template>
                </div>
            </div>
            <div class="card-body">
                <VCAlert
                    color="warning"
                    variant="soft"
                    size="sm"
                    class="flex flex-row gap-2 items-center mb-3"
                >
                    <div>
                        <VCIcon name="fa6-solid:upload" />
                    </div>
                    <div>
                        Upload one or more code files that define the logic of your analysis.
                        These files will later be packaged and distributed as part of the analysis image.
                    </div>
                </VCAlert>

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
