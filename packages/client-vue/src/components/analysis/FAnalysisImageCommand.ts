/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisFile, MasterImage } from '@privateaim/core';
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
            type: Object as PropType<AnalysisFile>,
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

        const analysisFileEntity = ref<null | AnalysisFile>(null);
        const analysisFileBusy = ref(false);

        const command = computed(() => {
            let command = '<Command>';

            if (
                masterImageEntity.value &&
                masterImageEntity.value.command &&
                !masterImageEntity.value.command.match(/\//g)
            ) {
                command = `/usr/bin/${masterImageEntity.value.command}`;
            }

            return command;
        });

        const file = computed(() => {
            if (!analysisFileEntity.value) {
                return '<File>';
            }

            return analysisFileEntity.value.name;
        });

        const loadMasterImage = wrapFnWithBusyState(masterImageBusy, async () => {
            if (!masterImageId.value) return;

            try {
                const item = await apiClient.masterImage.getOne(masterImageId.value);
                const { data } = await apiClient.masterImageGroup.getMany({
                    filters: {
                        virtual_path: item.group_virtual_path,
                    },
                });

                if (data.length === 1) {
                    item.command = item.command || data[0].command;
                    item.command_arguments = item.command_arguments || data[0].command_arguments;
                }

                masterImageEntity.value = item;
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
                    analysisFileEntity.value = await apiClient.analysisFile.getOne(props.analysisFileId);
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
            ' ',
            file.value,
        ]);
    },
});
