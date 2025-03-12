/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { VCTimeago } from '@vuecs/timeago';
import type { AnalysisLog } from '@privateaim/core-kit';
import { defineComponent, h, toRefs } from 'vue';
import type {
    PropType, VNode, VNodeArrayChildren,
    VNodeChild,
} from 'vue';

export default defineComponent({
    props: {
        index: {
            type: Number,
            default: 0,
        },
        entity: {
            type: Object as PropType<AnalysisLog>,
            required: true,
        },
    },
    setup(props) {
        const refs = toRefs(props);

        let message : VNode;
        if (refs.entity.value.error) {
            const parts : VNodeArrayChildren = ['An error '];

            if (refs.entity.value.error_code) {
                parts.push('with error code ');
                parts.push(h('strong', refs.entity.value.error_code));
                parts.push(' ');
            }

            parts.push('occurred');

            message = h('span', parts);
        } else if (refs.entity.value.status) {
            message = h('span', [
                'Event ',
                h('strong', refs.entity.value.event as string),
                ' triggered and status changed to ',
                h('strong', refs.entity.value.status),
            ]);
        } else {
            message = h('span', [
                'Event ',
                h('strong', refs.entity.value.event as string),
                ' triggered',
            ]);
        }

        return () => {
            let statusMessage : VNodeChild | undefined;

            if (refs.entity.value.status_message) {
                statusMessage = h('div', { class: 'line-status-message' }, [
                    refs.entity.value.status_message.replace(/\n/g, '\t'),
                ]);
            }

            return h(
                'div',
                {
                    class: `line line-${refs.index.value + 1}`,
                },
                [
                    h('div', { class: 'd-flex flex-row' }, [
                        h('div', { class: 'line-number' }, [refs.index.value + 1]),
                        h('div', { class: 'line-content d-flex flex-row' }, [
                            h('div', { class: `line-component ${refs.entity.value.component}` }, [
                                `${refs.entity.value.component}/${refs.entity.value.command}`,
                            ]),
                            h('div', { class: ['line-message', { error: refs.entity.value.error }] }, [
                                message,
                            ]),
                            h('div', { class: 'ms-auto' }, [
                                h(VCTimeago, { datetime: refs.entity.value.created_at }),
                            ]),
                        ]),
                    ]),
                    statusMessage,
                ],
            );
        };
    },
});
