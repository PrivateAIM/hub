/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { VCTimeago } from '@vuecs/timeago';
import type { Event } from '@privateaim/telemetry-kit';
import {
    defineComponent, 
    h, 
    toRef,
} from 'vue';
import type {
    PropType, 
    VNodeArrayChildren,
} from 'vue';

export default defineComponent({
    props: {
        index: {
            type: Number,
            default: 0,
        },
        entity: {
            type: Object as PropType<Event>,
            required: true,
        },
    },
    setup(props) {
        const entity = toRef(props, 'entity');

        const message : VNodeArrayChildren = [
            'Event ',
        ];

        message.push(
            h('strong', `${entity.value.name} (${entity.value.scope})`),
        );

        if (entity.value.refId) {
            message.push(h('span', { class: 'ms-1' }, [`(${entity.value.refId})`]));
        }

        message.push(' triggered.');

        // Worker failure events carry the reason as `data.error` (a string,
        // cut to 512 characters by server-core's aggregators).
        const error = typeof entity.value.data?.error === 'string' ?
            entity.value.data.error :
            undefined;

        return () => h(
            'div',
            { class: `line line-${props.index + 1}` },
            [
                h('div', { class: 'flex flex-row' }, [
                    h('div', { class: 'line-number' }, [props.index + 1]),
                    h('div', { class: 'line-content flex flex-row' }, [
                        h('div', { class: ['line-message', 'min-w-0'] }, [
                            message,
                            ...(error ?
                                [h('div', { class: 'text-error-600 whitespace-pre-wrap break-words', 'data-event-error': '' }, [error])] :
                                []),
                        ]),
                        h('div', { class: 'ms-auto' }, [
                            h(VCTimeago, { datetime: entity.value.createdAt }),
                        ]),
                    ]),
                ]),
            ],
        );
    },
});
