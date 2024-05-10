/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ATitle } from '@authup/client-web-kit';
import type {
    AnalysisNode,
} from '@privateaim/core';
import {
    DomainEventSubscriptionName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainEventSubscriptionFullName,
} from '@privateaim/core';
import type { FiltersBuildInput } from 'rapiq';

import type { PropType, SlotsType, VNodeChild } from 'vue';
import { computed, defineComponent, h } from 'vue';
import type { ListSlotsType } from '../../core';
import {
    createList, defineListEvents, defineListProps,
} from '../../core';
import type { DomainDetailsSlotProps } from '../type';
import FAnalysisNode from './FAnalysisNode';

enum Direction {
    IN = 'in',
    OUT = 'out',
}

export default defineComponent({
    props: {
        ...defineListProps<AnalysisNode>(),
        realmId: {
            type: String,
        },
        sourceId: {
            type: String,
            default: undefined,
        },
        target: {
            type: String as PropType<'node' | 'analysis'>,
            default: DomainType.NODE,
        },
        direction: {
            type: String as PropType<'in' | 'out'>,
            default: Direction.OUT,
        },
    },
    slots: Object as SlotsType<ListSlotsType<AnalysisNode>>,
    emits: defineListEvents<AnalysisNode>(),
    async setup(props, ctx) {
        const source = computed(() => (props.target === DomainType.NODE ?
            DomainType.ANALYSIS :
            DomainType.NODE));

        const isSameSocketRoom = (room?: string) => {
            if (props.realmId) {
                switch (props.direction) {
                    case Direction.IN:
                        return room === buildDomainChannelName(DomainSubType.ANALYSIS_NODE_IN);
                    case Direction.OUT:
                        return room === buildDomainChannelName(DomainSubType.ANALYSIS_NODE_OUT);
                }
            } else {
                return room === buildDomainChannelName(DomainType.ANALYSIS_NODE);
            }

            return false;
        };

        const isSocketEventForSource = (item: AnalysisNode) => {
            switch (source.value) {
                case DomainType.NODE:
                    if (typeof props.sourceId === 'undefined') {
                        return props.realmId === item.node_realm_id;
                    }

                    return props.sourceId === item.node_id;
                case DomainType.ANALYSIS:
                    if (typeof props.sourceId === 'undefined') {
                        return props.realmId === item.analysis_realm_id;
                    }

                    return props.sourceId === item.analysis_id;
            }

            return false;
        };

        const {
            render,
            setDefaults,
        } = createList({
            type: `${DomainType.ANALYSIS_NODE}`,
            props,
            setup: ctx,
            socket: {
                processEvent(event) {
                    return isSameSocketRoom(event.meta.roomName) &&
                        isSocketEventForSource(event.data);
                },
                buildSubscribeEventName() {
                    if (props.realmId) {
                        if (props.direction === Direction.IN) {
                            return buildDomainEventSubscriptionFullName(
                                DomainSubType.ANALYSIS_NODE_IN,
                                DomainEventSubscriptionName.SUBSCRIBE,
                            );
                        }

                        return buildDomainEventSubscriptionFullName(
                            DomainSubType.ANALYSIS_NODE_OUT,
                            DomainEventSubscriptionName.SUBSCRIBE,
                        );
                    }

                    return buildDomainEventSubscriptionFullName(
                        DomainType.ANALYSIS_NODE,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    );
                },
                buildUnsubscribeEventName() {
                    if (props.realmId) {
                        if (props.direction === Direction.IN) {
                            return buildDomainEventSubscriptionFullName(
                                DomainSubType.ANALYSIS_NODE_IN,
                                DomainEventSubscriptionName.UNSUBSCRIBE,
                            );
                        }

                        return buildDomainEventSubscriptionFullName(
                            DomainSubType.ANALYSIS_NODE_OUT,
                            DomainEventSubscriptionName.UNSUBSCRIBE,
                        );
                    }

                    return buildDomainEventSubscriptionFullName(
                        DomainType.ANALYSIS_NODE,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    );
                },
            },
            queryFilters: (q) => {
                let filter : FiltersBuildInput<AnalysisNode>;

                if (props.target === DomainType.NODE) {
                    filter = {
                        'node.name': q.length > 0 ? `~${q}` : q,
                    };
                } else {
                    filter = {
                        'analysis.name': q.length > 0 ? `~${q}` : q,
                    };
                }

                if (props.realmId) {
                    if (props.direction === Direction.IN) {
                        filter.node_realm_id = props.realmId;
                    } else {
                        filter.analysis_realm_id = props.realmId;
                    }
                }

                return filter;
            },
            query: () => {
                if (props.target === DomainType.NODE) {
                    return {
                        include: ['node'],
                    };
                }

                return {
                    include: ['analysis'],
                };
            },
        });

        setDefaults({
            header: {
                content: () => h(ATitle, {
                    text: props.target === DomainType.NODE ?
                        'Nodes' :
                        'Analyses',
                    icon: true,
                    iconClass: props.target === DomainType.NODE ?
                        'fa fa-hospital' :
                        'fa-solid fa-train-tram',
                }),
            },
            item: {
                content(
                    item,
                    itemProps,
                    sections,
                ) {
                    return h(FAnalysisNode, {
                        entity: item,
                        direction: props.direction,
                        target: props.target,
                        onUpdated: itemProps.updated,
                        onDeleted: itemProps.deleted,
                        onFailed: itemProps.failed,
                    }, {
                        default: (slotProps: DomainDetailsSlotProps<AnalysisNode>) => {
                            if (sections.slot) {
                                return sections.slot;
                            }

                            let text : VNodeChild | undefined;

                            if (
                                props.target === DomainType.NODE &&
                                slotProps.data.node
                            ) {
                                text = h('div', [slotProps.data.node.name]);
                            } else if (
                                props.target === DomainType.ANALYSIS &&
                                slotProps.data.analysis
                            ) {
                                text = h('div', [slotProps.data.analysis.name]);
                            } else {
                                text = h('div', [slotProps.data.id]);
                            }

                            return [
                                sections.icon,
                                text,
                                sections.actions,
                            ];
                        },
                    });
                },
            },

            noMore: {
                content: `No more ${props.target} available...`,
            },
        });

        return () => render();
    },
});
