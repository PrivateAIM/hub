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
    h,
    reactive,
    ref,
    toRef,
    watch,
} from 'vue';
import type { Analysis, AnalysisBucketFile } from '@privateaim/core-kit';
import { AnalysisBucketType, AnalysisConfigurationStatus } from '@privateaim/core-kit';
import { useModalController } from 'bootstrap-vue-next';
import { initFormAttributesFromSource, injectCoreHTTPClient, wrapFnWithBusyState } from '../../../core';
import FAnalysisWizardStepNodes from './FAnalysisWizardStepNodes.vue';
import FAnalysisWizardStepMasterImage from './FAnalysisWizardStepMasterImage.vue';
import FAnalysisWizardStepFiles from './FAnalysisWizardStepFiles.vue';
import FAnalysisWizardLockModal from './FAnalysisWizardLockModal.vue';

export default defineComponent({
    components: {
        FAnalysisWizardStepFiles,
        FormWizard,
        WizardButton,
        TabContent,

        FAnalysisWizardStepMasterImage,
        FAnalysisWizardStepNodes,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['finished', 'failed', 'updated'],
    async setup(props, { emit }) {
        const { confirm } = useModalController();
        const apiClient = injectCoreHTTPClient();
        const entity = toRef(props, 'entity');

        const entrypointFile = ref(null) as Ref<AnalysisBucketFile | null>;

        const resolveEntrypointFile = async () => {
            const { data: buckets } = await apiClient.analysisBucket.getMany({
                filters: {
                    type: AnalysisBucketType.CODE,
                    analysis_id: entity.value.id,
                },
            });
            const [bucket] = buckets;
            if (!bucket) {
                return;
            }

            const { data } = await apiClient.analysisBucketFile.getMany({
                filter: {
                    root: true,
                    bucket_id: bucket.id,
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

        const isBusy = ref(false);

        const initialized = ref(false);
        const valid = ref(false);

        const startIndex = ref(0);
        const index = ref(0);

        const steps = [
            AnalysisConfigurationStatus.NODES,
            AnalysisConfigurationStatus.MASTER_IMAGE,
            AnalysisConfigurationStatus.FILES,
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

        const canPassNodesWizardStep = async () => {
            if (entity.value.nodes <= 0) {
                throw new Error('One or more nodes have to be selected...');
            }

            return true;
        };

        const canPassMasterImageWizardStep = async () => {
            if (!form.master_image_id) {
                throw new Error('A master image must be selected...');
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
            isBusy.value = true;
            const step = steps[index.value];
            let promise : Promise<any>;

            switch (step) {
                case AnalysisConfigurationStatus.NODES:
                    promise = canPassNodesWizardStep();
                    break;
                case AnalysisConfigurationStatus.MASTER_IMAGE:
                    promise = canPassMasterImageWizardStep();
                    break;
                case AnalysisConfigurationStatus.FILES:
                    promise = canPassFilesWizardStep();
                    break;
                default:
                    promise = new Promise<void>((resolve) => resolve());
                    break;
            }

            promise
                .then(() => resolve(true))
                .catch((e) => reject(e))
                .finally(() => {
                    isBusy.value = false;
                });
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

        const setEntrypointFile = (item?: AnalysisBucketFile) => {
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

        const handleWizardFinishedEvent = wrapFnWithBusyState(isBusy, async () => {
            try {
                await canPassFilesWizardStep();

                if (typeof confirm === 'undefined') {
                    emit('finished');
                    return;
                }

                const finished = await confirm({
                    component: h(FAnalysisWizardLockModal, {
                        entity: entity.value,
                        onUpdated: (el) => {
                            handleUpdated(el);
                        },
                        onFailed: (e) => {
                            handleFailed(e);
                        },
                    }),
                });

                if (finished) {
                    emit('finished');
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        return {
            isBusy,

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
                Analysis configuration step by step
            </p>
        </template>
        <template #footer="props">
            <div class="wizard-footer-left">
                <WizardButton
                    v-if="props.activeTabIndex > 0"
                    :disabled="isBusy"
                    :style="props.fillButtonStyle"
                    @click.native="prevWizardStep"
                >
                    Back
                </WizardButton>
            </div>
            <div class="wizard-footer-right">
                <WizardButton
                    v-if="!props.isLastStep"
                    :disabled="isBusy"
                    class="wizard-footer-right"
                    :style="props.fillButtonStyle"
                    @click.native="nextWizardStep"
                >
                    Next
                </WizardButton>

                <WizardButton
                    v-else
                    :disabled="isBusy"
                    class="wizard-footer-right finish-button"
                    :style="props.fillButtonStyle"
                    @click.native="handleWizardFinishedEvent"
                >
                    Finish
                </WizardButton>
            </div>
        </template>

        <TabContent
            title="Nodes"
            :before-change="passWizardStep"
        >
            <FAnalysisWizardStepNodes
                :entity="entity"
                @updated="handleUpdated"
            />
        </TabContent>

        <TabContent
            title="MasterImage"
            :before-change="passWizardStep"
        >
            <FAnalysisWizardStepMasterImage
                :entity="entity"
                @updated="handleUpdated"
            />
        </TabContent>

        <TabContent
            title="Files"
            :before-change="passWizardStep"
        >
            <FAnalysisWizardStepFiles
                :entity="entity"
                :entrypoint-entity="entrypointFile"
                @entrypointChanged="setEntrypointFile"
                @failed="handleFailed"
            />
        </TabContent>
    </FormWizard>
</template>
