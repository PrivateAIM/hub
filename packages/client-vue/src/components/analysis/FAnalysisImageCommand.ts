/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile, MasterImage } from '@privateaim/core-kit';
import type { PropType } from 'vue';
import {
    computed, defineComponent, h, ref, toRef, watch,
} from 'vue';
import { injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';

export default defineComponent({
    props: {
        analysisId: {
            type: String,
            default: undefined,
        },
        masterImageId: {
            type: String,
            default: undefined,
        },
        analysisFileId: {
            type: String,
            default: undefined,
        },
        analysisFile: {
            type: Object as PropType<AnalysisBucketFile>,
        },
    },
    emits: ['failed'],
    async setup(props, { emit }) {
        const apiClient = injectCoreHTTPClient();

        const analysisFileId = toRef(props, 'analysisFileId');
        const analysisFile = toRef(props, 'analysisFile');
        const masterImageId = toRef(props, 'masterImageId');

        const masterImageEntity = ref<null | MasterImage>(null);
        const masterImageBusy = ref(false);

        const analysisFileEntity = ref<null | AnalysisBucketFile>(null);
        const analysisFileBusy = ref(false);

        const command = computed(() => {
            if (!masterImageEntity.value && !analysisFileEntity.value) {
                return '<Command> <File>';
            }

            const parts: string[] = [];

            if (
                masterImageEntity.value &&
                masterImageEntity.value.command &&
                !masterImageEntity.value.command.match(/\//g)
            ) {
                parts.push(`/usr/bin/${masterImageEntity.value.command}`);
            } else {
                parts.push('<Command>');
            }

            // todo: append command arguments (before)

            if (analysisFileEntity.value) {
                parts.push(analysisFileEntity.value.name);
            } else {
                parts.push('<File>');
            }

            // todo: append command arguments (after)

            return parts.join(' ');
        });

        const loadMasterImage = wrapFnWithBusyState(masterImageBusy, async () => {
            if (!masterImageId.value) return;

            try {
                masterImageEntity.value = await apiClient.masterImage.getOne(masterImageId.value);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        await loadMasterImage();

        watch(masterImageId, async (value, oldValue) => {
            if (value && value !== oldValue) {
                await loadMasterImage();
            }
        });

        const resolveAnalysisFile = wrapFnWithBusyState(analysisFileBusy, async () => {
            if (props.analysisFile) {
                analysisFileEntity.value = props.analysisFile;
                return;
            }

            if (props.analysisFileId) {
                if (
                    analysisFileEntity.value &&
                    analysisFileEntity.value.id === props.analysisFileId
                ) {
                    return;
                }

                try {
                    analysisFileEntity.value = await apiClient.analysisBucketFile.getOne(props.analysisFileId);
                } catch (e) {
                    if (e instanceof Error) {
                        emit('failed', e);
                    }
                }
            }

            analysisFileEntity.value = null;
        });

        await resolveAnalysisFile();

        watch(analysisFileId, async () => {
            await resolveAnalysisFile();
        });

        const analysisFileUpdated = computed(() => {
            if (analysisFile.value) {
                return analysisFile.value.updated_at;
            }

            return undefined;
        });

        watch(analysisFileUpdated, async () => {
            await resolveAnalysisFile();
        });

        await Promise.all([loadMasterImage, resolveAnalysisFile]);

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
