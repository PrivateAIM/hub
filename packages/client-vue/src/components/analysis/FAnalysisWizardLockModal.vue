<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisCommand } from '@privateaim/core-kit';
import { VCButton } from '@vuecs/button';
import { VCAlert } from '@vuecs/elements';
import { VCIcon } from '@vuecs/icon';
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';

export default defineComponent({
    components: {
        VCAlert,
        VCButton,
        VCIcon,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue', 'updated', 'executed', 'failed'],
    setup(props, { emit }) {
        const apiClient = injectCoreHTTPClient();

        const isBusy = ref(false);
        const lockIt = ref(true);
        const buildIt = ref(true);

        const close = () => {
            emit('update:modelValue', false);
        };

        const handleLockItChanged = () => {
            buildIt.value = lockIt.value;
        };

        const handleBuildItChanged = () => {

        };

        const execute = wrapFnWithBusyState(isBusy, async () => {
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
                close();
            }
        });

        return {
            isBusy,

            handleLockItChanged,
            handleBuildItChanged,

            buildIt,
            lockIt,

            execute,
            close,
        };
    },
});
</script>

<template>
    <VCModal
        :open="modelValue"
        @update:open="$emit('update:modelValue', $event)"
    >
        <VCModalContent class="modal-md">
            <div class="modal-header">
                <h6 class="mb-0">
                    Next Steps
                </h6>
                <VCModalClose class="btn-close" />
            </div>
            <div class="modal-body">
                <VCAlert
                    color="success"
                    variant="soft"
                    size="sm"
                    class="mb-3"
                >
                    The analysis is now in a state in which it can be locked and build.
                </VCAlert>
                <div class="flex flex-col gap-2">
                    <div>
                        <VCFormCheckbox
                            v-model="lockIt"
                            :disabled="isBusy"
                            :label="true"
                            :group-class="'inline-flex items-center gap-2 mb-0'"
                            @update:model-value="handleLockItChanged"
                        >
                            <template #label="props">
                                <label :for="props.id">
                                    <VCIcon name="fa6-solid:lock" /> Lock it?
                                </label>
                            </template>
                        </VCFormCheckbox>
                        In order to build the analysis, the configuration must be locked!
                    </div>
                    <div v-if="lockIt">
                        <VCFormCheckbox
                            v-model="buildIt"
                            :disabled="isBusy"
                            :label="true"
                            :group-class="'inline-flex items-center gap-2 mb-0'"
                            @update:model-value="handleBuildItChanged"
                        >
                            <template #label="props">
                                <label :for="props.id">
                                    <VCIcon name="fa6-solid:wrench" /> Build it?
                                </label>
                            </template>
                        </VCFormCheckbox>
                        Be aware that you will then no longer be able to modify the configuration after the build proccess is started.
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <div
                    class="flex flex-row"
                    style="width: 100%;"
                >
                    <div>
                        <VCButton
                            :disabled="isBusy"
                            color="neutral"
                            variant="soft"
                            size="xs"
                            @click.prevent="close()"
                        >
                            Cancel
                        </VCButton>
                    </div>
                    <div class="ms-auto">
                        <VCButton
                            :disabled="isBusy"
                            size="xs"
                            color="neutral"
                            @click.prevent="execute()"
                        >
                            Continue
                        </VCButton>
                    </div>
                </div>
            </div>
        </VCModalContent>
    </VCModal>
</template>
