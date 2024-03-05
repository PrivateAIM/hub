/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisFile, MasterImage } from '@privateaim/core';
import {
    computed, defineComponent, h, ref, toRefs, watch,
} from 'vue';
import { injectCoreAPIClient, wrapFnWithBusyState } from '../../core';

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
    },
    emits: ['failed'],
    async setup(props, { emit }) {
        const apiClient = injectCoreAPIClient();
        const refs = toRefs(props);

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
            if (!refs.masterImageId.value) return;

            try {
                const item = await apiClient.masterImage.getOne(refs.masterImageId.value);
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

        watch(refs.masterImageId, async (value, oldValue) => {
            if (value && value !== oldValue) {
                await loadMasterImage();
            }
        });

        const loadAnalysisFile = wrapFnWithBusyState(analysisFileBusy, async () => {
            if (!refs.analysisFileId.value) return;

            try {
                analysisFileEntity.value = await apiClient.analysisFile.getOne(refs.analysisFileId.value);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        await loadAnalysisFile();

        watch(refs.analysisFileId, async (value, oldValue) => {
            if (value) {
                if (value !== oldValue) {
                    await loadAnalysisFile();
                }
            } else {
                analysisFileEntity.value = null;
            }
        });

        await Promise.all([loadMasterImage, loadAnalysisFile]);

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
