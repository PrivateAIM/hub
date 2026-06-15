<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { FAnalysisBasicForm } from '@privateaim/client-vue';
import type { Analysis } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { PropType } from 'vue';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionName.ANALYSIS_UPDATE,
        ],
    },
    components: { FAnalysisBasicForm },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated'],
    setup(props, { emit }) {
        const handleUpdated = (entity: Analysis) => {
            emit('updated', entity);
        };

        return { handleUpdated };
    },
});
</script>
<template>
    <div v-if="entity">
        <div class="card-grey card mb-3">
            <div class="card-header">
                <div class="flex flex-row w-full">
                    <div>
                        <span class="title">Settings</span>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <FAnalysisBasicForm
                    :entity="entity"
                    @updated="handleUpdated"
                />
            </div>
        </div>
    </div>
</template>
