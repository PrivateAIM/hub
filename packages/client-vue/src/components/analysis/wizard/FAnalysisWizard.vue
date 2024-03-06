<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { FormWizard, TabContent, WizardButton } from 'vue3-form-wizard';
import type { PropType, Ref } from 'vue';
import {
    computed,
    defineComponent, reactive, ref, toRefs, watch,
} from 'vue';
import type { Analysis, AnalysisFile } from '@privateaim/core';
import {
    AnalysisConfigurationStatus,
} from '@privateaim/core';
import { initFormAttributesFromSource, injectCoreAPIClient } from '../../../core';
import TrainWizardStepBase from './FAnalysisWizardStepBase.vue';
import TrainFileManager from '../../analysis-file/FAnalysisFileManager.vue';
import TrainWizardStepFinal from './FAnalysisWizardStepFinal.vue';

export default defineComponent({
    components: {
        FormWizard,
        WizardButton,
        TabContent,

        TrainWizardStepFinal,
        TrainFileManager,
        TrainWizardStepBase,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['finished', 'failed', 'updated'],
    async setup(props, { emit }) {
        const apiClient = injectCoreAPIClient();
        const refs = toRefs(props);

        const form = reactive({
            query: null,
            master_image_id: null,
            station_ids: [],

            user_rsa_secret_id: null,
            user_paillier_secret_id: null,

            entrypoint_file_id: null,
            files: [],

            hash_signed: '',
            hash: null,
        });

        const updateForm = (entity: Partial<Analysis>) => {
            initFormAttributesFromSource(form, entity);
        };

        updateForm(refs.entity.value);

        const initialized = ref(false);
        const valid = ref(false);

        const startIndex = ref(0);
        const index = ref(0);

        const steps = [
            'configuration',
            'files',
            'finish',
        ];

        const isConfigured = computed(() => refs.entity.value.configuration_status === AnalysisConfigurationStatus.FINISHED);

        const updatedAt = computed(() => (refs.entity.value ?
            refs.entity.value.updated_at :
            undefined));

        watch(updatedAt, (val, oldValue) => {
            if (val && val !== oldValue) {
                updateForm(refs.entity.value);
            }
        });

        const handleUpdated = (entity: Analysis) => {
            updateForm(entity);

            emit('updated', entity);
        };

        const update = async (data: Partial<Analysis>) => {
            if (!initialized.value) return;

            const keys = Object.keys(data);

            if (keys.length === 0) return;

            const item = await apiClient.analysis.update(refs.entity.value.id, data);
            handleUpdated(item);
        };

        const wizardNode : Ref<typeof FormWizard> = ref(null);

        const canPassBaseWizardStep = async () => {
            if (!form.master_image_id) {
                throw new Error('A master image must be selected...');
            }

            if (refs.entity.value.nodes <= 0) {
                throw new Error('One or more stations have to be selected...');
            }

            return true;
        };

        const canPassFilesWizardStep = async () => {
            if (!form.entrypoint_file_id || form.entrypoint_file_id.length === 0) {
                throw new Error('An uploaded file must be selected as entrypoint.');
            }

            await update({ entrypoint_file_id: form.entrypoint_file_id });

            return true;
        };

        const passWizardStep = () : Promise<boolean> => new Promise((resolve, reject) => {
            const step = steps[index.value];
            let promise : Promise<any>;

            switch (step) {
                case 'configuration':
                    promise = canPassBaseWizardStep();
                    break;
                case 'files':
                    promise = canPassFilesWizardStep();
                    break;
                default:
                    promise = new Promise((resolve, reject) => {
                        reject(new Error('This step is not finished yet. Please fill out all required fields or make a choice of truth.'));
                    });
                    break;
            }

            promise
                .then(() => resolve(true))
                .catch((e) => reject(e));
        });

        const init = async () => {
            let canPass = true;
            let i = 0;

            while (canPass) {
                try {
                    await passWizardStep();

                    i++;
                    index.value = i;
                } catch (e) {
                    canPass = false;
                }

                if (i >= steps.length) {
                    canPass = false;
                }
            }

            if (wizardNode.value) {
                wizardNode.value.changeTab(0, i);
            } else {
                startIndex.value = i;
            }

            initialized.value = true;
        };

        await init();

        const prevWizardStep = () => {
            if (wizardNode.value) {
                wizardNode.value.prevTab();
            }
        };

        const nextWizardStep = () => {
            if (wizardNode.value) {
                wizardNode.value.nextTab();
            }
        };

        const setEntrypointFile = (item?: AnalysisFile) => {
            updateForm({ entrypoint_file_id: item ? item.id : null as string });
        };

        const handleWizardChangedEvent = (prevIndex: number, nextIndex: number) => {
            index.value = nextIndex;
            valid.value = true;
        };

        const handleWizardErrorEvent = (e?: Error) => {
            if (e instanceof Error) {
                emit('failed', e);
            }
        };

        const handleWizardFinishedEvent = () => {
            emit('finished');
        };

        return {
            startIndex,

            isConfigured,

            handleUpdated,
            handleWizardChangedEvent,
            handleWizardFinishedEvent,
            handleWizardErrorEvent,

            prevWizardStep,
            nextWizardStep,
            passWizardStep,

            setEntrypointFile,

            wizardNode,
        };
    },
});
</script>
<template>
    <div>
        <div v-if="isConfigured">
            <div class="alert alert-info alert-sm">
                The train is not in the configuration stage and already left the factory.
            </div>
        </div>
        <div v-else>
            <FormWizard
                ref="wizardNode"
                color="#333"
                title="Train Wizard"
                :subtitle="'Configure your analysis step by step'"
                :start-index="startIndex"
                @on-change="handleWizardChangedEvent"
                @on-complete="handleWizardFinishedEvent"
                @on-error="handleWizardErrorEvent"
            >
                <template #title>
                    <h4 class="wizard-title">
                        <i class="fa fa-hat-wizard" /> Analysis Wizard
                    </h4>
                    <p class="category">
                        Configure your analysis step by step
                    </p>
                </template>
                <template #footer="props">
                    <div class="wizard-footer-left">
                        <WizardButton
                            v-if="props.activeTabIndex > 0 && !props.isLastStep"
                            :style="props.fillButtonStyle"
                            @click.native="prevWizardStep"
                        >
                            Back
                        </WizardButton>
                    </div>
                    <div class="wizard-footer-right">
                        <WizardButton
                            v-if="!props.isLastStep"
                            class="wizard-footer-right"
                            :style="props.fillButtonStyle"
                            @click.native="nextWizardStep"
                        >
                            Next
                        </WizardButton>

                        <WizardButton
                            v-else
                            class="wizard-footer-right finish-button"
                            :style="props.fillButtonStyle"
                        >
                            Build train
                        </WizardButton>
                    </div>
                </template>

                <TabContent
                    title="Base"
                    :before-change="passWizardStep"
                >
                    <train-wizard-step-base
                        :entity="entity"
                        @updated="handleUpdated"
                    />
                </TabContent>

                <TabContent
                    title="Files"
                    :before-change="passWizardStep"
                >
                    <train-file-manager
                        :entity="entity"
                        @setEntrypointFile="setEntrypointFile"
                    />
                </TabContent>

                <TabContent title="Finish">
                    <train-wizard-step-final />
                </TabContent>
            </FormWizard>
        </div>
    </div>
</template>
