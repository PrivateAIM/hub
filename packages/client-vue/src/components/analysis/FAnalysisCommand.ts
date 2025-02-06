/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { usePermissionCheck } from '@authup/client-web-kit';
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisAPICommand, AnalysisBuildStatus } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { PropType } from 'vue';
import {
    computed, defineComponent, ref, toRef,
} from 'vue';
import {
    ActionCommandElementType, injectCoreHTTPClient, renderActionCommand, wrapFnWithBusyState,
} from '../../core';

const FAnalysisCommand = defineComponent({
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        command: {
            type: String as PropType<`${AnalysisAPICommand}`>,
            required: true,
        },

        elementType: {
            type: String as PropType<`${ActionCommandElementType}`>,
            default: ActionCommandElementType.BUTTON,
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
    emits: ['updated', 'executed', 'failed'],
    setup(props, { emit, slots }) {
        const apiClient = injectCoreHTTPClient();
        const busy = ref(false);

        const entity = toRef(props, 'entity');

        const execute = wrapFnWithBusyState(busy, async () => {
            try {
                const response = await apiClient
                    .analysis.runCommand(entity.value.id, props.command);

                emit('executed', props.command);
                emit('updated', response);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        const isAllowed = usePermissionCheck({
            name: PermissionName.ANALYSIS_UPDATE,
        });

        const shouldDisplay = computed<boolean>(() => {
            if (props.command === AnalysisAPICommand.CONFIGURATION_LOCK) {
                return !entity.value.configuration_locked &&
                    !entity.value.build_status;
            }

            if (props.command === AnalysisAPICommand.CONFIGURATION_UNLOCK) {
                if (!entity.value.configuration_locked) {
                    return false;
                }

                if (entity.value.configuration_locked && !entity.value.build_status) {
                    return true;
                }

                return entity.value.build_status === AnalysisBuildStatus.FAILED ||
                    entity.value.build_status === AnalysisBuildStatus.STOPPED ||
                    entity.value.build_status === AnalysisBuildStatus.STOPPING;
            }

            if (!entity.value.configuration_locked) {
                return false;
            }

            if (props.command === AnalysisAPICommand.BUILD_START) {
                if (!entity.value.build_status) {
                    return true;
                }

                return entity.value.build_status === AnalysisBuildStatus.FAILED ||
                    entity.value.build_status === AnalysisBuildStatus.STOPPED;
            }

            if (props.command === AnalysisAPICommand.BUILD_STOP) {
                return entity.value.build_status === AnalysisBuildStatus.STOPPING ||
                    entity.value.build_status === AnalysisBuildStatus.STARTED ||
                    entity.value.build_status === AnalysisBuildStatus.STARTING;
            }

            if (props.command === AnalysisAPICommand.BUILD_STATUS) {
                return entity.value.build_status &&
                    entity.value.build_status !== AnalysisBuildStatus.FINISHED;
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
                case AnalysisAPICommand.CONFIGURATION_LOCK:
                    return 'lock';
                case AnalysisAPICommand.CONFIGURATION_UNLOCK:
                    return 'unlock';
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
                case AnalysisAPICommand.CONFIGURATION_LOCK:
                    return 'fas fa-lock';
                case AnalysisAPICommand.CONFIGURATION_UNLOCK:
                    return 'fas fa-unlock';
                default:
                    return '';
            }
        });

        const classSuffix = computed(() => {
            switch (props.command) {
                case AnalysisAPICommand.BUILD_START:
                case AnalysisAPICommand.CONFIGURATION_LOCK:
                    return 'success';
                case AnalysisAPICommand.BUILD_STOP:
                case AnalysisAPICommand.CONFIGURATION_UNLOCK:
                    return 'danger';
                case AnalysisAPICommand.BUILD_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        });

        return () => {
            if (!shouldDisplay.value) {
                return [];
            }

            return renderActionCommand({
                execute,
                elementType: props.elementType,
                withIcon: props.withIcon,
                withText: props.withText,
                isDisabled: !shouldDisplay.value,
                iconClass: iconClass.value,
                isAllowed: isAllowed.value,
                commandText: commandText.value,
                classSuffix: classSuffix.value,
                slots,
            });
        };
    },
});

export {
    FAnalysisCommand,
};
