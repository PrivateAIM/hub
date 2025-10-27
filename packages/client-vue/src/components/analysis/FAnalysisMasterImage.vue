<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis, AnalysisBucketFile, MasterImage } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import {
    defineComponent,
} from 'vue';
import FMasterImagePicker from '../master-image/FMasterImagePicker';
import { injectCoreHTTPClient } from '../../core';
import FAnalysisImageCommand from './FAnalysisImageCommand';
import FAnalysisImageCommandArguments from './FAnalysisImageCommandArguments.vue';

export default defineComponent({
    components: {
        FAnalysisImageCommandArguments,
        FAnalysisImageCommand,
        FMasterImagePicker,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        entrypointEntity: {
            type: Object as PropType<AnalysisBucketFile>,
        },
        masterImageEntity: {
            type: Object as PropType<MasterImage>,
        },
    },
    emits: ['updated', 'failed', 'masterImageChanged'],
    setup(props, { emit }) {
        const apiClient = injectCoreHTTPClient();

        const handleMasterImageChanged = async (item: MasterImage | null) => {
            emit('masterImageChanged', item);

            try {
                const response = await apiClient.analysis.update(props.entity.id, {
                    master_image_id: item ? item.id : null,
                });

                emit('updated', response);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        };

        const handleUpdated = (value: Analysis) => {
            emit('updated', value);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            handleFailed,
            handleUpdated,
            handleMasterImageChanged,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column gap-2">
        <div>
            <h6><i class="fa fa-compact-disc" /> Base</h6>
            <div class="mb-2">
                <FMasterImagePicker
                    :entity-id="entity.master_image_id"
                    :entity="masterImageEntity"
                    @selected="handleMasterImageChanged"
                    @resolved="handleMasterImageChanged"
                />
            </div>
        </div>

        <hr>

        <div>
            <h6><i class="fa fa-keyboard" /> Command-Arguments</h6>

            <FAnalysisImageCommandArguments
                :entity="entity"
                :master-image-entity="masterImageEntity"
                @updated="handleUpdated"
            />
        </div>

        <hr>

        <div>
            <h6><i class="fa fa-terminal" /> Command</h6>

            <FAnalysisImageCommand
                class="mt-2 mb-2"
                :master-image="masterImageEntity"
                :master-image-id="entity.master_image_id"
                :analysis-file="entrypointEntity"
                :analysis="entity"
                :analysis-id="entity.id"
            />
        </div>
    </div>
</template>
