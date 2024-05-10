/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ATitle } from '@authup/client-web-kit';
import type {
    ProjectNode,
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
import FProjectNode from './FProjectNode';

enum Direction {
    IN = 'in',
    OUT = 'out',
}

export default defineComponent({
    props: {
        ...defineListProps<ProjectNode>(),
        realmId: {
            type: String,
        },
        sourceId: {
            type: String,
            default: undefined,
        },
        target: {
            type: String as PropType<'node' | 'project'>,
            default: DomainType.NODE,
        },
        direction: {
            type: String as PropType<'in' | 'out'>,
            default: Direction.OUT,
        },
    },
    slots: Object as SlotsType<ListSlotsType<ProjectNode>>,
    emits: defineListEvents<ProjectNode>(),
    async setup(props, ctx) {
        const source = computed(() => (props.target === DomainType.NODE ?
            DomainType.PROJECT :
            DomainType.NODE));

        const isSameSocketRoom = (room?: string) => {
            if (props.realmId) {
                switch (props.direction) {
                    case Direction.IN:
                        return room === buildDomainChannelName(DomainSubType.PROJECT_NODE_IN);
                    case Direction.OUT:
                        return room === buildDomainChannelName(DomainSubType.PROJECT_NODE_OUT);
                }
            } else {
                return room === buildDomainChannelName(DomainType.PROJECT_NODE);
            }

            return false;
        };

        const isSocketEventForSource = (item: ProjectNode) => {
            switch (source.value) {
                case DomainType.NODE:
                    if (typeof props.sourceId === 'undefined') {
                        return props.realmId === item.node_realm_id;
                    }

                    return props.sourceId === item.node_id;
                case DomainType.PROJECT:
                    if (typeof props.sourceId === 'undefined') {
                        return props.realmId === item.project_realm_id;
                    }

                    return props.sourceId === item.project_id;
            }

            return false;
        };

        const {
            render,
            setDefaults,
        } = createList({
            type: `${DomainType.PROJECT_NODE}`,
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
                                DomainSubType.PROJECT_NODE_IN,
                                DomainEventSubscriptionName.SUBSCRIBE,
                            );
                        }

                        return buildDomainEventSubscriptionFullName(
                            DomainSubType.PROJECT_NODE_OUT,
                            DomainEventSubscriptionName.SUBSCRIBE,
                        );
                    }

                    return buildDomainEventSubscriptionFullName(
                        DomainType.PROJECT_NODE,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    );
                },
                buildUnsubscribeEventName() {
                    if (props.realmId) {
                        if (props.direction === Direction.IN) {
                            return buildDomainEventSubscriptionFullName(
                                DomainSubType.PROJECT_NODE_IN,
                                DomainEventSubscriptionName.UNSUBSCRIBE,
                            );
                        }

                        return buildDomainEventSubscriptionFullName(
                            DomainSubType.PROJECT_NODE_OUT,
                            DomainEventSubscriptionName.UNSUBSCRIBE,
                        );
                    }

                    return buildDomainEventSubscriptionFullName(
                        DomainType.PROJECT_NODE,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    );
                },
            },
            queryFilters: (q) => {
                let filter : FiltersBuildInput<ProjectNode>;

                if (props.target === DomainType.NODE) {
                    filter = {
                        'node.name': q.length > 0 ? `~${q}` : q,
                    };
                } else {
                    filter = {
                        'project.name': q.length > 0 ? `~${q}` : q,
                    };
                }

                if (props.realmId) {
                    if (props.direction === Direction.IN) {
                        filter.node_realm_id = props.realmId;
                    } else {
                        filter.project_realm_id = props.realmId;
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
                    include: ['project'],
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
                        'fa-solid fa-file',
                }),
            },

            item: {
                content(
                    item,
                    itemProps,
                    slotContent,
                ) {
                    return h(FProjectNode, {
                        entity: item,
                        direction: props.direction,
                        target: props.target,
                        onUpdated: itemProps.updated,
                        onDeleted: itemProps.deleted,
                        onFailed: itemProps.failed,
                    }, {
                        default: (slotProps: DomainDetailsSlotProps<ProjectNode>) => {
                            if (slotContent.slot) {
                                return slotContent.slot;
                            }

                            let text : VNodeChild | undefined;

                            if (
                                props.target === DomainType.NODE &&
                                slotProps.data.node
                            ) {
                                text = h('div', [slotProps.data.node.name]);
                            } else if (
                                props.target === DomainType.PROJECT &&
                                slotProps.data.project
                            ) {
                                text = h('div', [slotProps.data.project.name]);
                            } else {
                                text = h('div', [slotProps.data.id]);
                            }

                            return [
                                slotContent.icon,
                                text,
                                slotContent.actions,
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
