/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { computed, defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import type { Analysis } from '@privateaim/core';
import {
    PermissionID,
    AnalysisAPICommand,
    AnalysisResultStatus,
    AnalysisRunStatus,
} from '@privateaim/core';
import {
    injectAPIClient, injectAuthupStore, renderActionCommand, wrapFnWithBusyState,
} from '../../../core';
import type { TrainCommandProperties } from './type';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        command: {
            type: String as PropType<`${AnalysisAPICommand}` | 'resultDownload'>,
            default: AnalysisAPICommand.RESULT_START,
        },

        elementType: {
            type: String as PropType<TrainCommandProperties['elementType']>,
            default: 'button',
        },
        withIcon: {
            type: Boolean,
            default: false,
        },
        withText: {
            type: Boolean,
            default: true,
        },
    },
    emits: ['failed', 'updated', 'executed'],
    setup(props, { emit, slots }) {
        const apiClient = injectAPIClient();
        const busy = ref(false);

        const store = injectAuthupStore();
        const isAllowed = computed(() => store.has(PermissionID.ANALYSIS_RESULT_READ));

        const isDisabled = computed(() => {
            if (props.entity.run_status !== AnalysisRunStatus.FINISHED) {
                return true;
            }

            if (props.command === 'resultDownload') {
                return !props.entity.result_status ||
                    (
                        props.entity.result_status !== AnalysisResultStatus.FINISHED &&
                        props.entity.result_status !== AnalysisResultStatus.DOWNLOADED
                    );
            }

            if (props.command === AnalysisAPICommand.RESULT_START) {
                return !!props.entity.result_status &&
                    [
                        AnalysisResultStatus.FAILED,
                    ].indexOf(props.entity.result_status) === -1;
            }

            return false;
        });

        const commandText = computed(() => {
            switch (props.command) {
                case 'resultDownload':
                    return 'download';
                case AnalysisAPICommand.RESULT_START:
                    return 'start';
                case AnalysisAPICommand.RESULT_STATUS:
                    return 'check';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (props.command) {
                case 'resultDownload':
                    return 'fa fa-download';
                case AnalysisAPICommand.RESULT_START:
                    return 'fa fa-wrench';
                case AnalysisAPICommand.RESULT_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        });

        const classSuffix = computed(() => {
            switch (props.command) {
                case 'resultDownload':
                    return 'dark';
                case AnalysisAPICommand.RESULT_START:
                    return 'success';
                case AnalysisAPICommand.RESULT_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        });

        const execute = wrapFnWithBusyState(busy, async () => {
            if (props.command === 'resultDownload') {
                window.open(
                    apiClient.analysis.getResultDownloadURL(props.entity.id),
                    '_blank',
                );
                return;
            }

            try {
                const train = await apiClient
                    .analysis.runCommand(props.entity.id, props.command);

                emit('executed', props.command);
                emit('updated', train);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        return () => renderActionCommand({
            execute,
            elementType: props.elementType,
            withIcon: props.withIcon,
            withText: props.withText,
            isDisabled: isDisabled.value,
            iconClass: iconClass.value,
            isAllowed: isAllowed.value,
            commandText: commandText.value,
            classSuffix: classSuffix.value,
            slots,
        });
    },
});
