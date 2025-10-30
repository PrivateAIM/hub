<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import { FAnalysisCodeFiles } from './index';

export default defineComponent({
    components: {
        FAnalysisCodeFiles,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },

});
</script>
<template>
    <FAnalysisCodeFiles
        ref="analysisCodeFiles"
        :entity="entity"
    />
</template>
