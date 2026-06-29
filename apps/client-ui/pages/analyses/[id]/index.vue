<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import {
    FAnalysisLogs,
    FAnalysisSteps,
} from '@privateaim/client-vue';
import { VCAlert } from '@vuecs/elements';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: {
        FAnalysisSteps,
        FAnalysisLogs,
        VCAlert,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['failed', 'executed', 'updated'],
    setup(props, { emit }) {
        const handleUpdated = (entity: Analysis) => {
            emit('updated', entity);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const handleExecuted = (component: string, command: string) => {
            emit('executed', component, command);
        };

        return {
            handleUpdated,
            handleFailed,
            handleExecuted,
        };
    },
});
</script>

<template>
    <div v-if="entity">
        <div class="flex flex-col gap-3">
            <div>
                <FAnalysisSteps
                    :entity="entity"
                    :configuration-code-link="'/analyses/' + entity.id + '/image'"
                    :configuration-nodes-link="'/analyses/' + entity.id + '/nodes'"
                    :configuration-image-link="'/analyses/' + entity.id + '/image'"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
            </div>

            <div v-if="entity.configuration_locked">
                <div class="card-grey card">
                    <div class="card-header">
                        <div class="title">
                            Logs
                        </div>
                    </div>
                    <div class="card-body">
                        <FAnalysisLogs
                            :entity-id="entity.id"
                        />
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="card-grey card">
                    <div class="card-header">
                        <div class="title">
                            Info
                        </div>
                    </div>
                    <div class="card-body">
                        <VCAlert
                            color="error"
                            variant="soft"
                            size="sm"
                            class="mb-0"
                        >
                            The analysis is not configured yet!<br>
                            Therefore follow the Pipeline Steps on the right to be able to submit your analysis.
                        </VCAlert>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
