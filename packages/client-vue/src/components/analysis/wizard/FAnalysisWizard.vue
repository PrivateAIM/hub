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
    defineComponent,
    reactive,
    ref,
    toRef,
    watch,
} from 'vue';
import type { Analysis, AnalysisFile } from '@privateaim/core';
import { AnalysisConfigurationStatus, AnalysisFileType } from '@privateaim/core';
import { initFormAttributesFromSource, injectCoreHTTPClient } from '../../../core';
import FAnalysisWizardStepBase from './FAnalysisWizardStepBase.vue';
import FAnalysisFileManager from '../../analysis-file/FAnalysisFileManager.vue';
import FAnalysisWizardStepFinal from './FAnalysisWizardStepFinal.vue';

export default defineComponent({
    components: {
        FormWizard,
        WizardButton,
        TabContent,

        FAnalysisWizardStepFinal,
        FAnalysisFileManager,
        FAnalysisWizardStepBase,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['finished', 'failed', 'updated'],
    async setup(props, { emit }) {
        const apiClient = injectCoreHTTPClient();
        const entity = toRef(props, 'entity');

        const entrypointFile = ref(null) as Ref<AnalysisFile | null>;

        const resolveEntrypointFile = async () => {
            const { data } = await apiClient.analysisFile.getMany({
                filter: {
                    root: true,
                    type: AnalysisFileType.CODE,
                    analysis_id: entity.value.id,
                },
            });

            if (data.length > 0) {
                [entrypointFile.value] = data;
            }
        };

        await resolveEntrypointFile();

        const form = reactive({
            query: null,
            master_image_id: null,

            files: [],

            hash_signed: '',
            hash: null,
        });

        const updateForm = (entity: Partial<Analysis>) => {
            initFormAttributesFromSource(form, entity);
        };

        updateForm(entity.value);

        const initialized = ref(false);
        const valid = ref(false);

        const startIndex = ref(0);
        const index = ref(0);

        const steps = [
            AnalysisConfigurationStatus.BASE_CONFIGURED,
            AnalysisConfigurationStatus.RESOURCE_CONFIGURED,
            AnalysisConfigurationStatus.FINISHED,
        ];

        const updatedAt = computed(() => (entity.value ?
            entity.value.updated_at :
            undefined));

        watch(updatedAt, (val, oldValue) => {
            if (val && val !== oldValue) {
                updateForm(entity.value);
            }
        });

        const handleUpdated = (entity: Analysis) => {
            updateForm(entity);

            emit('updated', entity);
        };

        const handleFailed = (e?: Error | null) => {
            emit('failed', e);
        };

        const wizardNode : Ref<typeof FormWizard | null> = ref(null);

        const canPassBaseWizardStep = async () => {
            if (!form.master_image_id) {
                throw new Error('A master image must be selected...');
            }

            if (entity.value.nodes <= 0) {
                throw new Error('One or more nodes have to be selected...');
            }

            return true;
        };

        const canPassFilesWizardStep = async () => {
            if (!entrypointFile.value) {
                throw new Error('An uploaded file must be selected as entrypoint.');
            }

            return true;
        };

        const passWizardStep = () : Promise<boolean> => new Promise((resolve, reject) => {
            const step = steps[index.value];
            let promise : Promise<any>;

            switch (step) {
                case AnalysisConfigurationStatus.BASE_CONFIGURED:
                    promise = canPassBaseWizardStep();
                    break;
                case AnalysisConfigurationStatus.RESOURCE_CONFIGURED:
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
            if (item) {
                entrypointFile.value = item;
            } else {
                entrypointFile.value = null;
            }
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

            handleFailed,
            handleUpdated,
            handleWizardChangedEvent,
            handleWizardFinishedEvent,
            handleWizardErrorEvent,

            prevWizardStep,
            nextWizardStep,
            passWizardStep,

            entrypointFile,
            setEntrypointFile,

            wizardNode,
        };
    },
});
</script>
<template>
    <FormWizard
        ref="wizardNode"
        color="#333"
        title="Wizard"
        :subtitle="'Configure your analysis step by step'"
        :start-index="startIndex"
        @on-change="handleWizardChangedEvent"
        @on-complete="handleWizardFinishedEvent"
        @on-error="handleWizardErrorEvent"
    >
        <template #title>
            <h4 class="wizard-title">
                <i class="fa fa-hat-wizard" /> Wizard
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
                    @click.native="handleWizardFinishedEvent"
                >
                    Lock
                </WizardButton>
            </div>
        </template>

        <TabContent
            title="Base"
            :before-change="passWizardStep"
        >
            <FAnalysisWizardStepBase
                :entity="entity"
                @updated="handleUpdated"
            />
        </TabContent>

        <TabContent
            title="Files"
            :before-change="passWizardStep"
        >
            <FAnalysisFileManager
                :entity="entity"
                :file-entity="entrypointFile"
                @setEntrypointFile="setEntrypointFile"
                @failed="handleFailed"
            />
        </TabContent>

        <TabContent title="Finish">
            <FAnalysisWizardStepFinal />
        </TabContent>
    </FormWizard>
</template>
