<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { FAnalysisMasterImage } from '@privateaim/client-vue';
import type { Analysis } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
    components: { FAnalysisMasterImage },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
        },
    },
    setup() {

    },
});
</script>
<template>
    <div
        v-if="entity"
        class="card-grey card mb-3"
    >
        <div class="card-header">
            <span class="title">Master Image</span>
        </div>
        <div class="card-body">
            <FAnalysisMasterImage
                :readonly="entity.configuration_locked"
                :entity="entity"
            />
        </div>
    </div>
</template>
