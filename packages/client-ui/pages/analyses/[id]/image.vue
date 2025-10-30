<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { FAnalysisImageCommand, FAnalysisImageCommandArguments, FMasterImagePicker } from '@privateaim/client-vue';

export default defineComponent({
    components: {
        FAnalysisImageCommand, FAnalysisImageCommandArguments, FMasterImagePicker,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
        },
    },
    setup() {
        const handleUpdated = () => {

        };
        const handleMasterImageChanged = async () => {

        };

        return {
            handleUpdated,
            handleMasterImageChanged,
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
                    <div class="d-flex flex-row gap-2 align-items-center alert alert-sm alert-warning">
                        <div>
                            <i class="fa fa-info" />
                        </div>
                        <div>
                            Pick a Docker-based master image that provides the runtime environment for your analysis.<br>
                            Your uploaded code will be embedded into this image before distribution.
                        </div>
                    </div>
                    <FMasterImagePicker
                        :readonly="entity.configuration_locked"
                        :entity-id="entity.master_image_id"
                        @selected="handleMasterImageChanged"
                        @resolved="handleMasterImageChanged"
                    />
                </div>
            </div>
            <div class="card-grey card mb-3">
                <div class="card-header">
                    <span class="title"><i class="fa fa-keyboard" /> Command-Arguments</span>
                </div>
                <div class="card-body">
                    <FAnalysisImageCommandArguments
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
                <div class="card-body" />
            </div>
            <div class="card-grey card mb-3">
                <div class="card-header">
                    <span class="title"><i class="fa fa-bolt" /> Command</span>
                </div>
                <div class="card-body">
                    <FAnalysisImageCommand
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
