<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import {
    FAnalysisBucketFile,
    FAnalysisBucketFileRootToggler,
    FAnalysisBucketFiles,
    FAnalysisImageCommand,
    FAnalysisImageCommandArguments,
    FAnalysisMasterImagePicker,
    FAnalysisTypeBucket,
    FPagination,
} from '@privateaim/client-vue';
import type { Analysis, AnalysisBucketFile } from '@privateaim/core-kit';
import { VCAlert } from '@vuecs/elements';
import { VCIcon } from '@vuecs/icon';
import type { PropType } from 'vue';
import { defineComponent, ref, useTemplateRef } from 'vue';

export default defineComponent({
    components: {
        FAnalysisBucketFile,
        FAnalysisBucketFiles,
        FAnalysisMasterImagePicker,
        FAnalysisBucketFileRootToggler,
        FAnalysisTypeBucket,
        FAnalysisImageCommand,
        FAnalysisImageCommandArguments,
        FPagination,
        VCAlert,
        VCIcon,
    },
    props: { entity: { type: Object as PropType<Analysis> } },
    emits: ['updated'],
    setup(_props, { emit }) {
        const lastRootFileId = ref<string | null>(null);
        const setLastRootFile = (entity: AnalysisBucketFile | null) => {
            if (entity) {
                lastRootFileId.value = entity.id;
            } else {
                lastRootFileId.value = null;
            }
        };

        const imageCommand = useTemplateRef<typeof FAnalysisImageCommand>('imageCommand');

        const handleUpdated = (entity: Analysis) => {
            emit('updated', entity);
        };

        const handAnalysisBucketFileDeleted = (entity: AnalysisBucketFile) => {
            if (entity.root) {
                lastRootFileId.value = null;
            }
        };

        const handAnalysisBucketFileUpdated = (entity: AnalysisBucketFile) => {
            if (entity.root) {
                lastRootFileId.value = entity.id;

                if (imageCommand.value) {
                    imageCommand.value.setAnalysisBucketFile(entity);
                }

                return;
            }

            if (lastRootFileId.value === entity.id) {
                if (imageCommand.value) {
                    imageCommand.value.setAnalysisBucketFile(null);
                }
            }
        };

        return {
            handleUpdated,

            handAnalysisBucketFileDeleted,
            handAnalysisBucketFileUpdated,

            setLastRootFile,
        };
    },
});
</script>
<template>
    <div
        v-if="entity"
        class="flex flex-wrap -mx-2"
    >
        <div class="w-full px-2 md:w-6/12">
            <div class="flex flex-col gap-3">
                <div class="card-grey card">
                    <div class="card-header">
                        <span class="title"><VCIcon name="fa6-solid:compact-disc" /> Base</span>
                    </div>
                    <div class="card-body">
                        <VCAlert
                            variant="soft"
                            size="sm"
                            class="flex flex-row gap-2 items-center mb-3"
                            :color="entity.configuration_image_valid ? 'warning' : 'error'"
                        >
                            <div>
                                <VCIcon name="fa6-solid:info" />
                            </div>
                            <div>
                                Pick a Docker-based master image that provides the runtime environment for your analysis.<br>
                                Your uploaded code will be embedded into this image before distribution.
                            </div>
                        </VCAlert>
                        <FAnalysisMasterImagePicker
                            :readonly="entity.configuration_locked"
                            :entity-id="entity.id"
                            :entity="entity"
                            @updated="handleUpdated"
                        />
                    </div>
                </div>
                <div class="card-grey card">
                    <div class="card-header">
                        <span class="title"><VCIcon name="fa6-solid:keyboard" /> Command-Arguments</span>
                    </div>
                    <div class="card-body">
                        <FAnalysisImageCommandArguments
                            :readonly="entity.configuration_locked"
                            :entity="entity"
                            @updated="handleUpdated"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full px-2 md:w-6/12">
            <div class="flex flex-col gap-3">
                <div class="card-grey card">
                    <div class="card-header">
                        <span class="title"><VCIcon name="fa6-solid:file" /> Entrypoint</span>
                    </div>
                    <div class="card-body">
                        <VCAlert
                            variant="soft"
                            size="sm"
                            class="flex flex-row gap-2 items-center mb-3"
                            :color="entity.configuration_entrypoint_valid ? 'warning' : 'error'"
                        >
                            <div>
                                <VCIcon name="fa6-solid:info" />
                            </div>
                            <div>
                                An entrypoint file must be selected.
                            </div>
                        </VCAlert>

                        <FAnalysisTypeBucket
                            :entity-id="entity.id"
                            :type="'CODE'"
                        >
                            <template #default="{ data: bucket }">
                                <FAnalysisBucketFiles
                                    :query="{ filters: { analysis_bucket_id: bucket.id } }"
                                    @updated="handAnalysisBucketFileUpdated"
                                    @deleted="handAnalysisBucketFileDeleted"
                                >
                                    <template #item="bucketFilesProps">
                                        <FAnalysisBucketFile
                                            :entity="bucketFilesProps.data"
                                            @updated="bucketFilesProps.updated"
                                            @deleted="bucketFilesProps.deleted"
                                            @failed="bucketFilesProps.failed"
                                        >
                                            <template #default="bucketFileProps">
                                                <div class="flex flex-row items-center gap-2 p-1 w-full">
                                                    <div>
                                                        {{ bucketFileProps.data.path }}
                                                    </div>

                                                    <div class="ms-auto">
                                                        <template v-if="!entity.configuration_locked">
                                                            <FAnalysisBucketFileRootToggler
                                                                :entity="bucketFileProps!.data!"
                                                                @updated="(value) => bucketFileProps!.update(value)"
                                                            />
                                                        </template>
                                                    </div>
                                                </div>
                                            </template>
                                        </FAnalysisBucketFile>
                                    </template>
                                    <template #footer="footerProps">
                                        <FPagination
                                            :load="footerProps.load"
                                            :meta="footerProps.meta"
                                        />
                                    </template>
                                </FAnalysisBucketFiles>
                            </template>
                        </FAnalysisTypeBucket>
                    </div>
                </div>
                <div class="card-grey card">
                    <div class="card-header">
                        <span class="title"><VCIcon name="fa6-solid:bolt" /> Command</span>
                    </div>
                    <div class="card-body">
                        <FAnalysisImageCommand
                            ref="imageCommand"
                            :master-image="entity.master_image"
                            :master-image-id="entity.master_image_id"
                            :entity="entity"
                            :entity-id="entity.id"
                            @analysis-bucket-file-resolved="setLastRootFile"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
