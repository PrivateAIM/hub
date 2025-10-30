/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Analysis, AnalysisBucketFile, MasterImage, MasterImageCommandArgument,
} from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import {
    computed,
    defineComponent, h, ref,
} from 'vue';
import { injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';

const filterImageCommandArgumentsForPosition = (
    input: MasterImageCommandArgument[],
    position: 'before' | 'after' = 'before',
) => {
    if (position === 'before') {
        return input.filter((item) => !item.position || item.position === 'before');
    }

    return input.filter((item) => item.position === 'after');
};

export default defineComponent({
    props: {
        analysisId: {
            type: String,
        },
        analysis: {
            type: Object as PropType<Analysis>,
        },
        analysisFileId: {
            type: String,
        },
        analysisFile: {
            type: Object as PropType<AnalysisBucketFile>,
        },
        masterImageId: {
            type: String,
        },
        masterImage: {
            type: Object as PropType<MasterImage>,
        },
    },
    emits: ['failed'],
    setup(props, { emit, expose }) {
        const apiClient = injectCoreHTTPClient();

        const analysis = ref<null | Analysis>(null);
        const analysisImageCommandArguments = computed(() => {
            if (
                analysis.value &&
                analysis.value.image_command_arguments &&
                analysis.value.image_command_arguments.length > 0
            ) {
                return analysis.value.image_command_arguments;
            }

            return null;
        });
        const analysisId = computed(() => {
            if (props.analysisId) {
                return props.analysisId;
            }

            if (props.analysis) {
                return props.analysis.id;
            }

            return null;
        });
        const analysisBusy = ref(false);

        const resolveAnalysis = wrapFnWithBusyState(analysisBusy, async () => {
            if (props.analysis) {
                analysis.value = props.analysis;
                return;
            }

            if (analysis.value) {
                return;
            }

            if (analysisId.value) {
                try {
                    analysis.value = await apiClient.analysis.getOne(analysisId.value);
                } catch (e) {
                    if (e instanceof Error) {
                        emit('failed', e);
                    }
                }
            }

            analysis.value = null;
        });

        const analysisBucketFile = ref<null | AnalysisBucketFile>(null);
        const analysisBucketFileBusy = ref(false);

        const resolveAnalysisFile = wrapFnWithBusyState(analysisBucketFileBusy, async () => {
            if (props.analysisFile) {
                analysisBucketFile.value = props.analysisFile;
                return;
            }

            if (props.analysisFileId) {
                if (
                    analysisBucketFile.value &&
                    analysisBucketFile.value.id === props.analysisFileId
                ) {
                    return;
                }

                try {
                    analysisBucketFile.value = await apiClient.analysisBucketFile.getOne(props.analysisFileId);
                } catch (e) {
                    if (e instanceof Error) {
                        emit('failed', e);
                    }
                }

                return;
            }

            // todo: optimize branch!
            if (analysisId.value) {
                const response = await apiClient.analysisBucket.getMany({
                    filters: {
                        type: AnalysisBucketType.CODE,
                        analysis_id: analysisId.value,
                    },
                });

                if (response.data.length === 0) {
                    return;
                }

                const [bucket] = response.data;
                const fileResponse = await apiClient.analysisBucketFile.getMany({
                    filters: {
                        bucket_id: bucket.id,
                        root: true,
                    },
                });

                if (fileResponse.data.length === 0) {
                    return;
                }

                [analysisBucketFile.value] = fileResponse.data;
                return;
            }

            analysisBucketFile.value = null;
        });

        const setAnalysisBucketFile = (entity: AnalysisBucketFile | null) => {
            analysisBucketFile.value = entity;
        };

        const masterImage = ref<null | MasterImage>(null);
        const masterImageCommandArguments = computed(() => {
            if (
                masterImage.value &&
                    masterImage.value.command_arguments &&
                    masterImage.value.command_arguments.length > 0
            ) {
                return masterImage.value.command_arguments;
            }

            return null;
        });
        const masterImageBusy = ref(false);
        const resolveMasterImage = wrapFnWithBusyState(
            masterImageBusy,
            async () => {
                if (props.masterImage) {
                    masterImage.value = props.masterImage;
                    return;
                }

                if (props.masterImageId) {
                    try {
                        masterImage.value = await apiClient.masterImage.getOne(props.masterImageId);
                    } catch (e) {
                        if (e instanceof Error) {
                            emit('failed', e);
                        }
                    }
                }
            },
        );

        const setMasterImage = (entity: MasterImage | null) => {
            masterImage.value = entity;
        };

        expose({
            setAnalysisBucketFile,
            setMasterImage,
        });

        Promise.resolve()
            .then(() => Promise.all([
                resolveAnalysis(),
                resolveAnalysisFile(),
                resolveMasterImage(),
            ]));

        const imageCommandArguments = computed(() => {
            if (analysisImageCommandArguments.value) {
                return analysisImageCommandArguments.value;
            }

            if (masterImageCommandArguments.value) {
                return masterImageCommandArguments.value;
            }

            return [];
        });

        const command = computed(() => {
            const parts: string[] = [];

            // 1. Command
            if (
                masterImage.value &&
                masterImage.value.command
            ) {
                // todo: is this necessary: !masterImage.value.command.match(/\//g)
                parts.push(`/usr/bin/${masterImage.value.command}`);
            } else {
                parts.push('<Command>');
            }

            // 2. Command Arguments (before)
            if (imageCommandArguments.value) {
                parts.push(
                    ...filterImageCommandArgumentsForPosition(imageCommandArguments.value, 'before')
                        .map((item) => item.value),
                );
            }

            // 3. Entrypoint
            if (analysisBucketFile.value) {
                parts.push(analysisBucketFile.value.name);
            } else {
                parts.push('<File>');
            }

            // 4. Command Arguments (after)
            if (imageCommandArguments.value) {
                parts.push(
                    ...filterImageCommandArgumentsForPosition(imageCommandArguments.value, 'after')
                        .map((item) => item.value),
                );
            }

            return parts.join(' ');
        });

        return () => h('div', {
            class: 'command-box',
        }, [
            h('strong', { class: 'pe-1 shell-sign' }, [
                '$',
            ]),
            command.value,
        ]);
    },
});
