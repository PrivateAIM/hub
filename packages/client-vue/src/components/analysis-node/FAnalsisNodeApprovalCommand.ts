/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { useAbilityCheck } from '@authup/client-web-kit';
import { AnalysisNodeApprovalCommand, AnalysisNodeApprovalStatus, PermissionID } from '@privateaim/core';
import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type { ActionCommandProperties } from '../../core';
import { injectCoreHTTPClient, renderActionCommand } from '../../core';

export default defineComponent({
    props: {
        entityId: {
            type: String,
            required: true,
        },
        approvalStatus: String as PropType<AnalysisNodeApprovalStatus>,

        command: {
            type: String as PropType<AnalysisNodeApprovalCommand>,
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
    setup(props, setup) {
        const apiClient = injectCoreHTTPClient();
        const busy = ref(false);

        const commandText = computed(() => {
            switch (props.command) {
                case AnalysisNodeApprovalCommand.APPROVE:
                    return 'approve';
                case AnalysisNodeApprovalCommand.REJECT:
                    return 'reject';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (props.command) {
                case AnalysisNodeApprovalCommand.APPROVE:
                    return 'fa fa-check';
                case AnalysisNodeApprovalCommand.REJECT:
                    return 'fa fa-ban';
                default:
                    return 'fa fa-sync-alt';
            }
        });

        const classSuffix = computed(() => {
            switch (props.command) {
                case AnalysisNodeApprovalCommand.APPROVE:
                    return 'success';
                case AnalysisNodeApprovalCommand.REJECT:
                    return 'danger';
                default:
                    return 'info';
            }
        });

        const isDisabled = computed(() => {
            if (props.approvalStatus) {
                if (
                    props.approvalStatus === AnalysisNodeApprovalStatus.APPROVED &&
                    props.command === AnalysisNodeApprovalCommand.APPROVE
                ) {
                    return true;
                }

                return props.approvalStatus === AnalysisNodeApprovalStatus.REJECTED &&
                    props.command === AnalysisNodeApprovalCommand.REJECT;
            }

            return props.command === AnalysisNodeApprovalCommand.REJECT;
        });

        const execute = async () => {
            if (busy.value) return;

            busy.value = true;

            let status;

            switch (props.command) {
                case AnalysisNodeApprovalCommand.APPROVE:
                    status = AnalysisNodeApprovalStatus.APPROVED;
                    break;
                case AnalysisNodeApprovalCommand.REJECT:
                    status = AnalysisNodeApprovalStatus.REJECTED;
                    break;
                default:
                    status = null;
                    break;
            }

            try {
                const item = await apiClient.analysisNode.update(props.entityId, {
                    approval_status: status,
                });

                setup.emit('updated', item);
            } catch (e) {
                setup.emit('failed', e);
            }

            busy.value = false;
        };

        const isAllowed = useAbilityCheck(PermissionID.ANALYSIS_APPROVE);

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
            slots: setup.slots,
        });
    },
});
