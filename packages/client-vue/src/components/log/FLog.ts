/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { VCTimeago } from '@vuecs/timeago';
import {
    computed,
    defineComponent, h, toRef,
} from 'vue';
import type {
    PropType,
} from 'vue';
import type { Log } from '@privateaim/telemetry-kit';
import { LogLevel } from '@privateaim/telemetry-kit';

export default defineComponent({
    props: {
        index: {
            type: Number,
            default: 0,
        },
        entity: {
            type: Object as PropType<Log>,
            required: true,
        },
    },
    setup(props) {
        const entity = toRef(props, 'entity');
        const index = toRef(props, 'index');

        const isError = computed(() => ([
            LogLevel.ERROR,
            LogLevel.CRITICAL,
            LogLevel.EMERGENCE,
            LogLevel.ALERT,
            LogLevel.WARNING,
        ] as `${LogLevel}`[]).indexOf(entity.value.level) !== -1);

        const isoDate = computed(() => {
            let date : Date;
            if (typeof entity.value.time === 'string') {
                date = new Date(Math.floor(Number(BigInt(entity.value.time) / 1_000_000n)));
            } else {
                date = new Date(Math.floor(Number(entity.value.time / 1_000_000n)));
            }

            return date.toISOString();
        });

        return () => h(
            'div',
            {
                class: `line line-${index.value + 1}`,
            },
            [
                h('div', { class: 'd-flex flex-row' }, [
                    h('div', { class: 'line-number' }, [index.value + 1]),
                    h('div', { class: 'line-content d-flex flex-row' }, [
                        h('div', { class: 'line-component' }, [
                            `[${entity.value.level}]`,
                        ]),
                        h('div', { class: ['line-message', { error: isError.value }] }, [
                            entity.value.message,
                        ]),
                        h('div', { class: 'ms-auto' }, [
                            h(VCTimeago, { datetime: isoDate.value }),
                        ]),
                    ]),
                ]),
            ],
        );
    },
});
