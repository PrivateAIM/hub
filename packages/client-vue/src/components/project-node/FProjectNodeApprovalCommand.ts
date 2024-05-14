/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { useAbilityCheck } from '@authup/client-web-kit';
import {
    PermissionID,
    ProjectNodeApprovalCommand,
    ProjectNodeApprovalStatus,
} from '@privateaim/core';
import type { PropType } from 'vue';
import {
    computed, defineComponent, ref,
} from 'vue';
import {
    injectCoreHTTPClient,
    renderActionCommand,
    wrapFnWithBusyState,
} from '../../core';
import type { ActionCommandProperties } from '../../core';

export default defineComponent({
    props: {
        entityId: {
            type: String,
            required: true,
        },
        approvalStatus: String as PropType<ProjectNodeApprovalStatus>,
        command: {
            type: String as PropType<ProjectNodeApprovalCommand>,
            required: true,
        },
        elementType: {
            type: String as PropType<ActionCommandProperties['elementType']>,
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
    emits: ['failed', 'updated'],
    setup(props, { emit, slots }) {
        const busy = ref(false);
        const apiClient = injectCoreHTTPClient();

        const commandText = computed(() => {
            switch (props.command) {
                case ProjectNodeApprovalCommand.APPROVE:
                    return 'approve';
                case ProjectNodeApprovalCommand.REJECT:
                    return 'reject';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (props.command) {
                case ProjectNodeApprovalCommand.APPROVE:
                    return 'fa fa-check';
                case ProjectNodeApprovalCommand.REJECT:
                    return 'fa fa-ban';
                default:
                    return 'fa fa-sync-alt';
            }
        });

        const classSuffix = computed(() => {
            switch (props.command) {
                case ProjectNodeApprovalCommand.APPROVE:
                    return 'success';
                case ProjectNodeApprovalCommand.REJECT:
                    return 'danger';
                default:
                    return 'info';
            }
        });

        const isDisabled = computed(() => {
            if (props.approvalStatus) {
                if (
                    props.approvalStatus === ProjectNodeApprovalStatus.APPROVED &&
                    props.command === ProjectNodeApprovalCommand.APPROVE
                ) {
                    return true;
                }

                return props.approvalStatus === ProjectNodeApprovalStatus.REJECTED &&
                    props.command === ProjectNodeApprovalCommand.REJECT;
            }

            return props.command === ProjectNodeApprovalCommand.REJECT;
        });

        const execute = wrapFnWithBusyState(busy, async () => {
            let status;

            switch (props.command) {
                case ProjectNodeApprovalCommand.APPROVE:
                    status = ProjectNodeApprovalStatus.APPROVED;
                    break;
                case ProjectNodeApprovalCommand.REJECT:
                    status = ProjectNodeApprovalStatus.REJECTED;
                    break;
                default:
                    status = null;
                    break;
            }

            try {
                const item = await apiClient.projectNode.update(props.entityId, {
                    approval_status: status,
                });

                emit('updated', item);
            } catch (e) {
                emit('failed', e);
            }
        });

        const isAllowed = useAbilityCheck(PermissionID.PROJECT_APPROVE);

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
