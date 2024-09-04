/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisNodeRunStatus } from '@privateaim/core-kit';
import { computed, defineComponent, h } from 'vue';
import { hasNormalizedSlot, normalizeSlot } from '../../core';

export default defineComponent({
    props: {
        status: {
            type: String,
            default: null,
        },
    },
    setup(props, { slots }) {
        const statusText = computed(() => {
            if (props.status) {
                return props.status;
            }

            return 'none';
        });

        const classSuffix = computed(() => {
            switch (props.status) {
                case AnalysisNodeRunStatus.STARTED:
                case AnalysisNodeRunStatus.STARTING: {
                    return 'primary';
                }
                case AnalysisNodeRunStatus.FINISHED:
                case AnalysisNodeRunStatus.FINISHING: {
                    return 'success';
                }
                case AnalysisNodeRunStatus.STOPPED:
                case AnalysisNodeRunStatus.STOPPING: {
                    return 'warning';
                }
                case AnalysisNodeRunStatus.FAILED: {
                    return 'danger';
                }
            }

            return 'info';
        });

        if (hasNormalizedSlot('default', slots)) {
            return () => normalizeSlot(
                'default',
                {
                    classSuffix: classSuffix.value,
                    statusText: statusText.value,
                },
                slots,
            );
        }

        return () => h('span', {
            class: `text-${classSuffix.value}`,
        }, [statusText.value]);
    },
});
