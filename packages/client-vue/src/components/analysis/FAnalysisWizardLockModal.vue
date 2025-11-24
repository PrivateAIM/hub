<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisCommand } from '@privateaim/core-kit';
import { BModal } from 'bootstrap-vue-next';
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';

export default defineComponent({
    components: {
        BModal,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'executed', 'failed'],
    setup(props, { emit }) {
        const apiClient = injectCoreHTTPClient();

        const isBusy = ref(false);
        const lockIt = ref(true);
        const buildIt = ref(true);

        const handleLockItChanged = () => {
            buildIt.value = lockIt.value;
        };

        const handleBuildItChanged = () => {

        };

        const execute = wrapFnWithBusyState(isBusy, async (fn: CallableFunction) => {
            try {
                let entity: Analysis;
                if (lockIt.value) {
                    entity = await apiClient
                        .analysis.runCommand(props.entity.id, AnalysisCommand.CONFIGURATION_LOCK);

                    emit('updated', entity);
                }

                if (buildIt.value) {
                    entity = await apiClient
                        .analysis.runCommand(props.entity.id, AnalysisCommand.BUILD_START);

                    emit('updated', entity);
                }

                emit('executed');
            } catch (e) {
                emit('failed', e);
            } finally {
                fn();
            }
        });

        return {
            isBusy,

            handleLockItChanged,
            handleBuildItChanged,

            buildIt,
            lockIt,

            execute,
        };
    },
});
</script>

<template>
    <BModal
        :size="'md'"
        :no-close-on-backdrop="true"
        :no-close-on-esc="true"
    >
        <template #header>
            <h6 class="mb-0">
                Next Steps
            </h6>
        </template>
        <template #default>
            <div class="alert alert-success alert-sm">
                <i class="fa fa-info" /> The analysis is now in a state in which it can be locked and build.<br>
            </div>
            <div class="d-flex flex-column gap-2">
                <div>
                    <VCFormInputCheckbox
                        v-model="lockIt"
                        :disabled="isBusy"
                        :label="true"
                        :group-class="'form-switch mb-0'"
                        @change="handleLockItChanged"
                    >
                        <template #label="props">
                            <label :for="props.id">
                                <i class="fa fa-lock" /> Lock it?
                            </label>
                        </template>
                    </VCFormInputCheckbox>
                    In order to build the analysis, the configuration must be locked!
                </div>
                <div v-if="lockIt">
                    <VCFormInputCheckbox
                        v-model="buildIt"
                        :disabled="isBusy"
                        :label="true"
                        :group-class="'form-switch mb-0'"
                        @change="handleBuildItChanged"
                    >
                        <template #label="props">
                            <label :for="props.id">
                                <i class="fa fa-wrench" /> Build it?
                            </label>
                        </template>
                    </VCFormInputCheckbox>
                    Be aware that you will then no longer be able to modify the configuration after the build proccess is started.
                </div>
            </div>
        </template>
        <template #footer="props">
            <div
                class="d-flex flex-row"
                style="width: 100%;"
            >
                <div>
                    <button
                        :disabled="isBusy"
                        type="button"
                        class="btn btn-secondary btn-xs"
                        @click.prevent="props.cancel()"
                    >
                        Cancel
                    </button>
                </div>
                <div class="ms-auto">
                    <button
                        :disabled="isBusy"
                        type="button"
                        class="btn btn-xs btn-dark"
                        @click.prevent="execute(props.ok)"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </template>
    </BModal>
</template>
