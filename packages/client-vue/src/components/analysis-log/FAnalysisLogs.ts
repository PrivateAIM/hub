/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    AnalysisLog,
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
import FAnalysisLog from './FAnalysisLog';

export default defineComponent({
    props: {
        entityId: {
            type: String,
            required: true,
        },
        realmId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, setup) {
        const rootNode = ref<null | HTMLElement>(null);

        const scrollToLastLine = (meta: ListMeta<AnalysisLog>) => {
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
            type: `${DomainType.ANALYSIS_LOG}`,
            onCreated(_entity, meta) {
                scrollToLastLine(meta);
            },
            socket: {
                processEvent(event) {
                    return event.meta.roomName !== buildDomainChannelName(DomainType.ANALYSIS_LOG) ||
                        event.data.analysis_id !== props.entityId;
                },
            },
            props,
            setup,
            loadAll: true,
            query: {
                filters: {
                    analysis_id: props.entityId,
                },
                sort: {
                    created_at: 'ASC',
                },
            },
        });

        setDefaults({
            noMore: {
                content: 'No more logs available...',
            },
            item: {
                content(item: AnalysisLog, slotProps: ListItemSlotProps<AnalysisLog>) {
                    return h(
                        FAnalysisLog,
                        {
                            entity: item,
                            index: slotProps.index,
                            onDeleted() {
                                if (slotProps && slotProps.deleted) {
                                    slotProps.deleted(item);
                                }
                            },
                            onUpdated: (e: AnalysisLog) => {
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
