/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Analysis, AnalysisBucketFile, MasterImage, MasterImageCommandArgument,
} from '@privateaim/core-kit';
import type { PropType } from 'vue';
import {
    computed,
    defineComponent, h, ref, toRef, watch,
} from 'vue';
import { injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';
import { useUpdatedAt } from '../../composables';

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
    async setup(props, { emit }) {
        const apiClient = injectCoreHTTPClient();

        const analysis = ref<null | Analysis>(null);
        const analysisBusy = ref(false);

        const resolveAnalysis = wrapFnWithBusyState(analysisBusy, async () => {
            if (props.analysis) {
                analysis.value = props.analysis;
                return;
            }

            if (props.analysisId) {
                if (
                    analysis.value &&
                    analysis.value.id === props.analysisId
                ) {
                    return;
                }

                try {
                    analysis.value = await apiClient.analysis.getOne(props.analysisId);
                } catch (e) {
                    if (e instanceof Error) {
                        emit('failed', e);
                    }
                }
            }

            analysis.value = null;
        });

        const analysisFile = ref<null | AnalysisBucketFile>(null);
        const analysisFileBusy = ref(false);

        const resolveAnalysisFile = wrapFnWithBusyState(analysisFileBusy, async () => {
            if (props.analysisFile) {
                analysisFile.value = props.analysisFile;
                return;
            }

            if (props.analysisFileId) {
                if (
                    analysisFile.value &&
                    analysisFile.value.id === props.analysisFileId
                ) {
                    return;
                }

                try {
                    analysisFile.value = await apiClient.analysisBucketFile.getOne(props.analysisFileId);
                } catch (e) {
                    if (e instanceof Error) {
                        emit('failed', e);
                    }
                }
            }

            analysisFile.value = null;
        });

        const masterImage = ref<null | MasterImage>(null);
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

        const masterImageProp = toRef(props, 'masterImage');
        const masterImagePropUpdated = useUpdatedAt(masterImageProp);
        watch(
            masterImagePropUpdated,
            (val, oldVal) => {
                if (val !== oldVal) {
                    resolveMasterImage();
                }
            },
        );

        const masterImageIdProp = toRef(props, 'masterImageId');
        watch(
            masterImageIdProp,
            (val, oldVal) => {
                if (val !== oldVal) {
                    resolveMasterImage();
                }
            },
        );

        await Promise.all([
            resolveAnalysis(),
            resolveAnalysisFile(),
            resolveMasterImage(),
        ]);

        const command = computed(() => {
            if (
                !analysis.value &&
                !analysisFile.value &&
                !masterImage.value
            ) {
                return '<Command> <File>';
            }

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
            if (
                analysis.value &&
                analysis.value.image_command_arguments
            ) {
                parts.push(
                    ...filterImageCommandArgumentsForPosition(analysis.value.image_command_arguments, 'before')
                        .map((item) => item.value),
                );
            } else if (
                masterImage.value &&
                masterImage.value.command_arguments
            ) {
                parts.push(
                    ...filterImageCommandArgumentsForPosition(masterImage.value.command_arguments, 'before')
                        .map((item) => item.value),
                );
            }

            // 3. Entrypoint
            if (analysisFile.value) {
                parts.push(analysisFile.value.name);
            } else {
                parts.push('<File>');
            }

            // 4. Command Arguments (after)
            if (
                analysis.value &&
                analysis.value.image_command_arguments
            ) {
                parts.push(
                    ...filterImageCommandArgumentsForPosition(analysis.value.image_command_arguments, 'after')
                        .map((item) => item.value),
                );
            } else if (
                masterImage.value &&
                masterImage.value.command_arguments
            ) {
                parts.push(
                    ...filterImageCommandArgumentsForPosition(masterImage.value.command_arguments, 'after')
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
