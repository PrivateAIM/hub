/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { computed, defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import type { Analysis } from '@privateaim/core';
import {
    AnalysisAPICommand,
    AnalysisBuildStatus,
    AnalysisConfigurationStatus,
    PermissionID,
} from '@privateaim/core';
import {
    injectAuthupStore,
    injectCoreAPIClient,
    renderActionCommand,
    wrapFnWithBusyState,
} from '../../../core';
import type { AnalysisCommandProperties } from './type';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        command: {
            type: String as PropType<AnalysisAPICommand>,
            default: AnalysisAPICommand.BUILD_START,
        },

        elementType: {
            type: String as PropType<AnalysisCommandProperties['elementType']>,
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
        const apiClient = injectCoreAPIClient();
        const busy = ref(false);

        const store = injectAuthupStore();
        const isAllowed = computed(() => store.has(PermissionID.ANALYSIS_EDIT));

        const isDisabled = computed<boolean>(() => {
            if (props.entity.configuration_status !== AnalysisConfigurationStatus.FINISHED) {
                return true;
            }

            if (props.command === AnalysisAPICommand.BUILD_START) {
                return !!props.entity.build_status &&
                    [
                        AnalysisBuildStatus.STOPPING,
                        AnalysisBuildStatus.FAILED,
                    ].indexOf(props.entity.build_status) === -1;
            }

            if (props.command === AnalysisAPICommand.BUILD_STOP) {
                return !!props.entity.build_status && [
                    AnalysisBuildStatus.STOPPING,
                ].indexOf(props.entity.build_status) === -1;
            }

            return false;
        });

        const commandText = computed(() => {
            switch (props.command) {
                case AnalysisAPICommand.BUILD_START:
                    return 'start';
                case AnalysisAPICommand.BUILD_STOP:
                    return 'stop';
                case AnalysisAPICommand.BUILD_STATUS:
                    return 'check';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (props.command) {
                case AnalysisAPICommand.BUILD_START:
                    return 'fa fa-play';
                case AnalysisAPICommand.BUILD_STOP:
                    return 'fa fa-stop';
                case AnalysisAPICommand.BUILD_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        });

        const classSuffix = computed(() => {
            switch (props.command) {
                case AnalysisAPICommand.BUILD_START:
                    return 'success';
                case AnalysisAPICommand.BUILD_STOP:
                    return 'danger';
                case AnalysisAPICommand.BUILD_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        });

        const execute = wrapFnWithBusyState(busy, async () => {
            try {
                const entity = await apiClient
                    .analysis.runCommand(props.entity.id, props.command);

                emit('executed', props.command);
                emit('updated', entity);
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
