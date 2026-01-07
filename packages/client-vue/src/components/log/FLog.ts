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
import { LogLevel, LogLevelColor } from '@privateaim/telemetry-kit';

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

        const isoDate = computed(() => new Date(entity.value.time).toISOString());

        const color = computed(() => {
            switch (entity.value.level) {
                case LogLevel.EMERGENCE: {
                    return LogLevelColor.EMERGENCE;
                }
                case LogLevel.ALERT: {
                    return LogLevelColor.ALERT;
                }
                case LogLevel.CRITICAL: {
                    return LogLevelColor.CRITICAL;
                }
                case LogLevel.ERROR: {
                    return LogLevelColor.ERROR;
                }
                case LogLevel.WARNING: {
                    return LogLevelColor.WARNING;
                }
                case LogLevel.NOTICE: {
                    return LogLevelColor.NOTICE;
                }
                case LogLevel.INFORMATIONAL: {
                    return LogLevelColor.INFORMATIONAL;
                }
                case LogLevel.DEBUG: {
                    return LogLevelColor.DEBUG;
                }
                default: {
                    return null;
                }
            }
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
                        h('div', { class: 'line-component', style: `color: ${color.value}` }, [
                            `${entity.value.level}`,
                        ]),
                        h('div', { class: ['line-message', { error: isError.value }] }, [
                            entity.value.message,
                        ]),
                        h('div', { class: 'line-date ms-auto' }, [
                            h(VCTimeago, { datetime: isoDate.value }),
                        ]),
                    ]),
                ]),
            ],
        );
    },
});
