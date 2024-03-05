/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { PropType } from 'vue';
import { computed, defineComponent, h } from 'vue';
import { AnalysisNodeApprovalStatus } from '@privateaim/core';
import { hasNormalizedSlot, normalizeSlot } from '../../core';

export default defineComponent({
    props: {
        status: {
            type: String as PropType<AnalysisNodeApprovalStatus>,
            default: undefined,
        },
    },
    setup(props, { slots }) {
        const statusText = computed(() => {
            switch (props.status) {
                case AnalysisNodeApprovalStatus.APPROVED:
                    return 'approved';
                case AnalysisNodeApprovalStatus.REJECTED:
                    return 'rejected';
                default:
                    return 'none';
            }
        });

        const classSuffix = computed(() => {
            switch (props.status) {
                case 'approved':
                    return 'success';
                case 'rejected':
                    return 'danger';
                default:
                    return 'info';
            }
        });

        if (hasNormalizedSlot('default', slots)) {
            return () => normalizeSlot('default', {
                classSuffix: classSuffix.value,
                statusText: statusText.value,
            }, slots);
        }

        return () => h('span', { class: `text-${classSuffix.value}` }, statusText.value);
    },
});
