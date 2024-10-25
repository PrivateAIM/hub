/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    MasterImageEventLog,
} from '@privateaim/core-kit';
import {
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import type { ListItemSlotProps } from '@vuecs/list-controls';
import {
    defineComponent, h, ref,
} from 'vue';
import type { ListMeta } from '../../core';
import { createList } from '../../core';
import FMasterImageEventLog from './FMasterImageEventLog';

export default defineComponent({
    setup(props, setup) {
        const rootNode = ref<null | HTMLElement>(null);

        const scrollToLastLine = (meta: ListMeta<MasterImageEventLog>) => {
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
            type: `${DomainType.MASTER_IMAGE_EVENT_LOG}`,
            onCreated(_entity, meta) {
                scrollToLastLine(meta);
            },
            socket: {
                processEvent(event) {
                    return event.meta.roomName !== buildDomainChannelName(DomainType.MASTER_IMAGE_EVENT_LOG);
                },
            },
            props,
            setup,
            loadAll: true,
            query: {
                sort: {
                    created_at: 'ASC',
                },
            },
            queryFilters: (q) => ({
                title: q.length > 0 ? `~${q}` : q,
            }),
        });

        setDefaults({
            noMore: {
                content: 'No more logs available...',
            },
            item: {
                content(item: MasterImageEventLog, slotProps: ListItemSlotProps<MasterImageEventLog>) {
                    return h(
                        FMasterImageEventLog,
                        {
                            entity: item,
                            index: slotProps.index,
                            onDeleted() {
                                if (slotProps && slotProps.deleted) {
                                    slotProps.deleted(item);
                                }
                            },
                            onUpdated: (e: MasterImageEventLog) => {
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
