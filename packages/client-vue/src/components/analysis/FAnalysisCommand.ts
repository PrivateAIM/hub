/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { usePermissionCheck } from '@authup/client-web-kit';
import type { Analysis } from '@privateaim/core-kit';
import {
    AnalysisBuilderCommandChecker,
    AnalysisCommand,
    AnalysisConfiguratorCommandChecker,
    AnalysisDistributorCommandChecker,
} from '@privateaim/core-kit';
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
            type: String as PropType<`${AnalysisCommand}`>,
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
        const isBusy = ref(false);

        const entity = toRef(props, 'entity');

        const execute = wrapFnWithBusyState(isBusy, async () => {
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
                try {
                    switch (props.command) {
                        case AnalysisCommand.BUILD_START:
                            AnalysisBuilderCommandChecker.canStart(entity.value);
                            return true;

                        case AnalysisCommand.BUILD_CHECK:
                            AnalysisBuilderCommandChecker.canCheck(entity.value);
                            return true;

                        case AnalysisCommand.DISTRIBUTION_START:
                            AnalysisDistributorCommandChecker.canStart(entity.value);
                            return true;

                        case AnalysisCommand.DISTRIBUTION_CHECK:
                            AnalysisDistributorCommandChecker.canCheck(entity.value);
                            return true;

                        case AnalysisCommand.CONFIGURATION_LOCK:
                            AnalysisConfiguratorCommandChecker.canLock(entity.value);
                            return true;

                        case AnalysisCommand.CONFIGURATION_UNLOCK:
                            AnalysisConfiguratorCommandChecker.canUnlock(entity.value);
                            return true;
                    }
                } catch (e) {
                    // do nothing
                }

                return false;
            },
        );

        const commandText = computed(() => {
            switch (props.command) {
                case AnalysisCommand.BUILD_START:
                case AnalysisCommand.DISTRIBUTION_START:
                    return 'start';
                case AnalysisCommand.BUILD_CHECK:
                case AnalysisCommand.DISTRIBUTION_CHECK:
                    return 'check';
                case AnalysisCommand.CONFIGURATION_LOCK:
                    return 'lock';
                case AnalysisCommand.CONFIGURATION_UNLOCK:
                    return 'unlock';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (props.command) {
                case AnalysisCommand.BUILD_START:
                case AnalysisCommand.DISTRIBUTION_START:
                    return 'fa fa-play';
                case AnalysisCommand.BUILD_CHECK:
                case AnalysisCommand.DISTRIBUTION_CHECK:
                    return 'fas fa-search';
                case AnalysisCommand.CONFIGURATION_LOCK:
                    return 'fas fa-lock';
                case AnalysisCommand.CONFIGURATION_UNLOCK:
                    return 'fas fa-unlock';
                default:
                    return '';
            }
        });

        const classSuffix = computed(() => {
            switch (props.command) {
                case AnalysisCommand.BUILD_START:
                case AnalysisCommand.CONFIGURATION_LOCK:
                case AnalysisCommand.DISTRIBUTION_START:
                    return 'success';
                case AnalysisCommand.CONFIGURATION_UNLOCK:
                    return 'danger';
                case AnalysisCommand.BUILD_CHECK:
                case AnalysisCommand.DISTRIBUTION_CHECK:
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
