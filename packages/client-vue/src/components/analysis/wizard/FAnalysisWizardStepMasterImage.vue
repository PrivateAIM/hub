<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis, MasterImage } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import {
    defineComponent,
} from 'vue';
import FMasterImagePicker from '../../master-image/FMasterImagePicker';
import { injectCoreHTTPClient } from '../../../core';

export default defineComponent({
    components: {
        FMasterImagePicker,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'failed'],
    setup(props, { emit }) {
        const apiClient = injectCoreHTTPClient();
        const handleMasterImageSelected = async (item: MasterImage) => {
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

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            handleFailed,
            handleMasterImageSelected,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column">
        <div>
            <h6><i class="fa fa-compact-disc" /> MasterImage</h6>
            <div class="mb-2">
                <FMasterImagePicker
                    :entity-id="entity.master_image_id"
                    @selected="handleMasterImageSelected"
                />
            </div>
        </div>
    </div>
</template>
