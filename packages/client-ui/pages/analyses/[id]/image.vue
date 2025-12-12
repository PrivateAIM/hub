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
} from '@privateaim/client-vue';
import type { Analysis, AnalysisBucketFile } from '@privateaim/core-kit';
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
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
        },
    },
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
        class="row"
    >
        <div class="col-12 col-md-6">
            <div class="card-grey card mb-3">
                <div class="card-header">
                    <span class="title"><i class="fa fa-compact-disc" /> Base</span>
                </div>
                <div class="card-body">
                    <div
                        class="d-flex flex-row gap-2 align-items-center alert alert-sm"
                        :class="{
                            'alert-warning': entity.configuration_image_valid,
                            'alert-danger': !entity.configuration_image_valid,
                        }"
                    >
                        <div>
                            <i class="fa fa-info" />
                        </div>
                        <div>
                            Pick a Docker-based master image that provides the runtime environment for your analysis.<br>
                            Your uploaded code will be embedded into this image before distribution.
                        </div>
                    </div>
                    <FAnalysisMasterImagePicker
                        :readonly="entity.configuration_locked"
                        :entity-id="entity.id"
                        :entity="entity"
                        @updated="handleUpdated"
                    />
                </div>
            </div>
            <div class="card-grey card mb-3">
                <div class="card-header">
                    <span class="title"><i class="fa fa-keyboard" /> Command-Arguments</span>
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
        <div class="col-12 col-md-6">
            <div class="card-grey card mb-3">
                <div class="card-header">
                    <span class="title"><i class="fa fa-file" /> Entrypoint</span>
                </div>
                <div class="card-body">
                    <div
                        class="d-flex flex-row gap-2 align-items-center alert alert-sm"
                        :class="{
                            'alert-warning': entity.configuration_entrypoint_valid,
                            'alert-danger': !entity.configuration_entrypoint_valid,
                        }"
                    >
                        <div>
                            <i class="fa fa-info" />
                        </div>
                        <div>
                            An entrypoint file must be selected.
                        </div>
                    </div>

                    <FAnalysisTypeBucket
                        :entity-id="entity.id"
                        :type="'CODE'"
                    >
                        <template #default="{ data: bucket }">
                            <FAnalysisBucketFiles
                                :query-filters="{ bucket_id: bucket.id }"
                                @updated="handAnalysisBucketFileUpdated"
                                @deleted="handAnalysisBucketFileDeleted"
                            >
                                <template #itemActions="bucketFilesProps">
                                    <FAnalysisBucketFile
                                        :entity="bucketFilesProps.data"
                                        @updated="bucketFilesProps.updated"
                                        @deleted="bucketFilesProps.deleted"
                                        @failed="bucketFilesProps.failed"
                                    >
                                        <template #default="bucketFileProps">
                                            <template v-if="!entity.configuration_locked">
                                                <FAnalysisBucketFileRootToggler
                                                    :entity="bucketFileProps!.data!"
                                                    @updated="(value) => bucketFileProps!.update(value)"
                                                />
                                            </template>
                                        </template>
                                    </FAnalysisBucketFile>
                                </template>
                            </FAnalysisBucketFiles>
                        </template>
                    </FAnalysisTypeBucket>
                </div>
            </div>
            <div class="card-grey card mb-3">
                <div class="card-header">
                    <span class="title"><i class="fa fa-bolt" /> Command</span>
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
</template>
