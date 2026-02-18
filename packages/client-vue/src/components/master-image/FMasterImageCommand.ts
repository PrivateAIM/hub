/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { usePermissionCheck } from '@authup/client-web-kit';
import type { MasterImage } from '@privateaim/core-kit';
import {
    MasterImageCommand,
} from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { PropType, SlotsType } from 'vue';
import {
    computed, defineComponent, ref,
} from 'vue';
import type { ActionCommandSlotsType } from '../../core';
import {
    ActionCommandElementType, injectCoreHTTPClient, renderActionCommand, wrapFnWithBusyState,
} from '../../core';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<MasterImage>,
        },
        command: {
            type: String as PropType<`${MasterImageCommand}`>,
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
    slots: Object as SlotsType<ActionCommandSlotsType>,
    setup(props, { emit, slots }) {
        const apiClient = injectCoreHTTPClient();
        const isBusy = ref(false);

        const execute = wrapFnWithBusyState(isBusy, async () => {
            try {
                const response = await apiClient
                    .masterImage.runCommand(props.command);

                emit('executed', props.command);
                emit('updated', response);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        const isAllowed = usePermissionCheck({
            name: PermissionName.MASTER_IMAGE_MANAGE,
        });

        const shouldDisplay = computed<boolean>(
            () => isAllowed.value,
        );

        const commandText = computed(() => {
            switch (props.command) {
                case MasterImageCommand.SYNC:
                    return 'Synchronize';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (props.command) {
                case MasterImageCommand.SYNC:
                    return 'fa fa-sync';
                default:
                    return '';
            }
        });

        const classSuffix = computed(() => {
            switch (props.command) {
                case MasterImageCommand.SYNC:
                    return 'success';
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
