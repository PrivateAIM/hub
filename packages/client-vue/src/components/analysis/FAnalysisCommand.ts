/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useAbilityCheck } from '@authup/client-web-kit';
import type { Analysis } from '@privateaim/core';
import { AnalysisAPICommand, AnalysisBuildStatus, PermissionID } from '@privateaim/core';
import type { PropType } from 'vue';
import {
    computed, defineComponent, ref, toRef,
} from 'vue';
import {
    ActionCommandElementType,
    injectCoreHTTPClient,
    renderActionCommand,
    wrapFnWithBusyState,
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

        const isAllowed = useAbilityCheck(PermissionID.ANALYSIS_EDIT);

        const isHidden = computed<boolean>(() => {
            if (props.command === AnalysisAPICommand.CONFIGURATION_LOCK) {
                return entity.value.configuration_locked;
            }

            if (props.command === AnalysisAPICommand.CONFIGURATION_UNLOCK) {
                return !entity.value.configuration_locked;
            }

            if (!entity.value.configuration_locked) {
                return true;
            }

            if (props.command === AnalysisAPICommand.BUILD_START) {
                if (!entity.value.build_status) {
                    return false;
                }

                return entity.value.build_status !== AnalysisBuildStatus.STOPPING &&
                    entity.value.build_status !== AnalysisBuildStatus.FAILED;
            }

            if (props.command === AnalysisAPICommand.BUILD_STOP) {
                if (!entity.value.build_status) {
                    return true;
                }

                return entity.value.build_status === AnalysisBuildStatus.STOPPING ||
                    entity.value.build_status === AnalysisBuildStatus.FINISHED;
            }

            if (props.command === AnalysisAPICommand.BUILD_STATUS) {
                return entity.value.build_status === AnalysisBuildStatus.FINISHED;
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
            if (isHidden.value) {
                return [];
            }

            return renderActionCommand({
                execute,
                elementType: props.elementType,
                withIcon: props.withIcon,
                withText: props.withText,
                isDisabled: isHidden.value,
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
