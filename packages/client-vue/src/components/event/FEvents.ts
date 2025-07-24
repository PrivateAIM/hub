/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    Event,
} from '@privateaim/core-kit';
import {
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import type { ListItemSlotProps } from '@vuecs/list-controls';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import {
    defineComponent, h, nextTick, ref,
} from 'vue';
import type { ListMeta } from '../../core';
import { createList } from '../../core';
import FEvent from './FEvent';

export default defineComponent({
    props: {
        query: {
            type: Object as PropType<BuildInput<Event>>,
        },
    },
    setup(props, setup) {
        const rootNode = ref<null | HTMLElement>(null);

        const scrollToLastLine = (meta: ListMeta<Event>) => {
            if (!rootNode.value) {
                return;
            }

            const el = rootNode.value.getElementsByClassName(`line-${meta.total}`)[0];

            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        };

        const {
            render,
            setDefaults,
        } = createList({
            type: `${DomainType.EVENT}`,
            onCreated(_entity, meta) {
                scrollToLastLine(meta);
            },
            onLoaded(meta) {
                nextTick(() => {
                    scrollToLastLine(meta);
                });
            },
            socket: {
                processEvent(event) {
                    return event.meta.roomName !== buildDomainChannelName(DomainType.EVENT);
                },
            },
            props,
            setup,
            loadAll: true,
            query: () => ({
                ...props.query,
                sort: {
                    created_at: 'ASC',
                },
            } satisfies BuildInput<Event>),
        });

        setDefaults({
            noMore: {
                content: 'No more events available...',
            },
            item: {
                content(item: Event, slotProps: ListItemSlotProps<Event>) {
                    return h(
                        FEvent,
                        {
                            entity: item,
                            index: slotProps.index,
                            onDeleted() {
                                if (slotProps && slotProps.deleted) {
                                    slotProps.deleted(item);
                                }
                            },
                            onUpdated: (e: Event) => {
                                if (slotProps && slotProps.updated) {
                                    slotProps.updated(e);
                                }
                            },
                        },
                    );
                },
            },
        });

        return () => h('div', {
            ref: rootNode,
            class: 'log-container',
        }, [
            h('div', {
                class: 'log-body',
            }, [
                render(),
            ]),
        ]);
    },
});
