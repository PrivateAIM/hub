<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis, AnalysisBucketFile, MasterImage } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent, ref, useTemplateRef } from 'vue';
import {
    FAnalysisBucketFileRootToggler,
    FAnalysisCodeFiles,
    FAnalysisImageCommand,
    FAnalysisImageCommandArguments,
    FAnalysisMasterImagePicker,
} from '@privateaim/client-vue';

export default defineComponent({
    components: {
        FAnalysisMasterImagePicker,
        FAnalysisBucketFileRootToggler,
        FAnalysisCodeFiles,
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
        const lastMasterImage = ref<MasterImage | null>(null);

        const imageCommand = useTemplateRef<typeof FAnalysisImageCommand>('imageCommand');

        const handleUpdated = (entity: Analysis) => {
            if (entity.master_image) {
                lastMasterImage.value = entity.master_image;
            }

            emit('updated', entity);
        };

        const handleMasterImageResolved = (entity: MasterImage | null) => {
            console.log(entity);

            lastMasterImage.value = entity;
        };
        const handleMasterImageToggled = (entity: MasterImage | null) => {
            if (imageCommand.value) {
                imageCommand.value.setMasterImage(entity);
            }

            lastMasterImage.value = entity;
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

            handleMasterImageResolved,
            handleMasterImageToggled,

            lastMasterImage,

            handAnalysisBucketFileUpdated,
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
                        :master-image-entity="lastMasterImage"
                        :readonly="entity.configuration_locked"
                        :entity="entity"
                        @updated="(data) => $emit('updated', data)"
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

                    <FAnalysisCodeFiles
                        ref="analysisCodeFiles"
                        :entity="entity"
                        :readonly="true"
                        @updated="handAnalysisBucketFileUpdated"
                    >
                        <template #itemActions="props">
                            <template v-if="!entity.configuration_locked">
                                <FAnalysisBucketFileRootToggler
                                    :entity="props.data"
                                    @updated="(entity) => props.update(entity)"
                                />
                            </template>
                        </template>
                    </FAnalysisCodeFiles>
                </div>
            </div>
            <div class="card-grey card mb-3">
                <div class="card-header">
                    <span class="title"><i class="fa fa-bolt" /> Command</span>
                </div>
                <div class="card-body">
                    <FAnalysisImageCommand
                        ref="imageCommand"
                        class="mt-2 mb-2"
                        :master-image-id="entity.master_image_id"
                        :analysis="entity"
                        :analysis-id="entity.id"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
