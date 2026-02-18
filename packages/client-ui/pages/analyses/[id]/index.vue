<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ref } from 'vue';
import type { PropType } from 'vue';
import type { Analysis } from '@privateaim/core-kit';
import {
    FAnalysisLogs, FAnalysisSteps,
} from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: {
        FAnalysisSteps,
        FAnalysisLogs,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['failed', 'executed', 'updated'],
    setup(props, { emit }) {
        const logVNode = ref<typeof FAnalysisLogs | null>(null);
        const logVNodeBusy = ref(false);

        const reload = async () => {
            if (logVNode.value) {
                logVNodeBusy.value = true;
                await logVNode.value.reload();
                logVNodeBusy.value = false;
            }
        };

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
            logVNode,
            logVNodeBusy,
            reload,

            handleUpdated,
            handleFailed,
            handleExecuted,
        };
    },
});
</script>

<template>
    <div v-if="entity">
        <div class="d-flex flex-column gap-3">
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
                        <div class="ms-auto">
                            <button
                                type="button"
                                :disabled="logVNodeBusy"
                                class="btn btn-xs btn-primary"
                                @click.prevent="reload"
                            >
                                <i class="fa fa-refresh" />
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <FAnalysisLogs
                            ref="logVNode"
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
                        <div class="d-flex flex-row gap-2 align-items-center alert alert-sm alert-danger mb-0">
                            <div>
                                <i class="fa fa-info" />
                            </div>
                            <div>
                                The analysis is not configured yet!<br>
                                Therefore follow the Pipeline Steps on the right to be able to submit your analysis.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.panel-box {
    background-color: #ececec;
    border: 1px solid #dedede;
    transition: all .3s ease-in-out;
    border-radius: 4px;
    padding: 0.5rem 1rem;
}
</style>
