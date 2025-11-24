/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { usePermissionCheck } from '@authup/client-web-kit';
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisAPICommand, isAnalysisAPICommandExecutable } from '@privateaim/core-kit';
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

        const shouldDisplay = computed<boolean>(
            () => {
                const check = isAnalysisAPICommandExecutable(entity.value, props.command);
                return check.success;
            },
        );

        const commandText = computed(() => {
            switch (props.command) {
                case AnalysisAPICommand.BUILD_START:
                case AnalysisAPICommand.DISTRIBUTION_START:
                    return 'start';
                case AnalysisAPICommand.BUILD_STATUS:
                case AnalysisAPICommand.DISTRIBUTION_CHECK:
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
                case AnalysisAPICommand.DISTRIBUTION_START:
                    return 'fa fa-play';
                case AnalysisAPICommand.BUILD_STATUS:
                case AnalysisAPICommand.DISTRIBUTION_CHECK:
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
                case AnalysisAPICommand.DISTRIBUTION_START:
                    return 'success';
                case AnalysisAPICommand.CONFIGURATION_UNLOCK:
                    return 'danger';
                case AnalysisAPICommand.BUILD_STATUS:
                case AnalysisAPICommand.DISTRIBUTION_CHECK:
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
