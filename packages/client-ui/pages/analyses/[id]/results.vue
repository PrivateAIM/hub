<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { computed } from 'vue';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import { type Analysis, type AnalysisFile, AnalysisFileType } from '@privateaim/core';
import { FAnalysisFileDownload, FAnalysisFiles } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { FAnalysisFiles, FAnalysisFileDownload },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'failed'],
    setup(props) {
        const query = computed<BuildInput<AnalysisFile>>(() => ({
            filter: {
                type: AnalysisFileType.RESULT,
                analysis_id: props.entity.id,
            },
        } satisfies BuildInput<AnalysisFile>));

        return {
            query,
        };
    },
});
</script>
<template>
    <div class="panel-box">
        <FAnalysisFiles
            v-if="entity"
            :query="query"
        >
            <template #itemActions="{ data }">
                <FAnalysisFileDownload
                    :entity="data"
                    :with-icon="true"
                />
            </template>
        </FAnalysisFiles>
    </div>
</template>
