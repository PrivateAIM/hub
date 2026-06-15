/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ATitle } from '@authup/client-web-kit';
import type {
    ProjectNode,
} from '@privateaim/core-kit';
import {
    DomainEventSubscriptionName,
    DomainSubType,
    DomainType,
} from '@privateaim/core-kit';
import { buildDomainEventFullName, hasOwnProperty } from '@privateaim/kit';
import type { RelationsBuildInput } from 'rapiq';

import type { PropType, SlotsType, VNodeChild } from 'vue';
import { computed, defineComponent, h } from 'vue';
import type { ListSlotsType } from '../../core';
import {
    createList, 
    defineListEvents, 
    defineListProps,
} from '../../core';
import FDisplayName from '../FDisplayName';
import type { DomainDetailsSlotProps } from '../type';
import FProjectNode from './FProjectNode';

enum Direction {
    IN = 'in',
    OUT = 'out',
}

export default defineComponent({
    props: {
        ...defineListProps<ProjectNode>(),
        realmId: { type: String },
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
            default: `${Direction.OUT}`,
        },
        includeNode: {
            type: Boolean,
            default: false,
        },
        includeProject: {
            type: Boolean,
            default: false,
        },
    },
    emits: defineListEvents<ProjectNode>(),
    slots: Object as SlotsType<ListSlotsType<ProjectNode>>,
    async setup(props, ctx) {
        const source = computed(() => (props.target === DomainType.NODE ?
            DomainType.PROJECT :
            DomainType.NODE));

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
                // Realm scoping is handled by the namespace and the base-room check in
                // createEntitySocket; here we only confirm the event belongs to this source.
                processEvent(event) {
                    return isSocketEventForSource(event.data);
                },
                // Branch on the effective realmId (resolved by createEntitySocket — undefined
                // for master-realm sockets on the root namespace), not props.realmId, so the
                // subscribe event always matches the namespace the socket actually connects to:
                // directional handlers live only in realm namespaces, the base handler only at root.
                buildSubscribeEventName(realmId) {
                    if (realmId) {
                        if (props.direction === Direction.IN) {
                            return buildDomainEventFullName(
                                DomainSubType.PROJECT_NODE_IN,
                                DomainEventSubscriptionName.SUBSCRIBE,
                            );
                        }

                        return buildDomainEventFullName(
                            DomainSubType.PROJECT_NODE_OUT,
                            DomainEventSubscriptionName.SUBSCRIBE,
                        );
                    }

                    return buildDomainEventFullName(
                        DomainType.PROJECT_NODE,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    );
                },
                buildUnsubscribeEventName(realmId) {
                    if (realmId) {
                        if (props.direction === Direction.IN) {
                            return buildDomainEventFullName(
                                DomainSubType.PROJECT_NODE_IN,
                                DomainEventSubscriptionName.UNSUBSCRIBE,
                            );
                        }

                        return buildDomainEventFullName(
                            DomainSubType.PROJECT_NODE_OUT,
                            DomainEventSubscriptionName.UNSUBSCRIBE,
                        );
                    }

                    return buildDomainEventFullName(
                        DomainType.PROJECT_NODE,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    );
                },
            },
            queryFilters: (filters) => {
                if (
                    hasOwnProperty(filters, 'name') &&
                    typeof filters.name === 'string' &&
                    filters.name.length > 0
                ) {
                    if (props.target === DomainType.NODE) {
                        filters['node.name'] = filters.name;
                    } else {
                        filters['project.name'] = filters.name;
                    }

                    delete filters.name;
                }

                if (props.realmId) {
                    if (props.direction === Direction.IN) {
                        filters.node_realm_id = props.realmId;
                    } else {
                        filters.project_realm_id = props.realmId;
                    }
                }
            },
            query: () => {
                const include : string[] = [];
                if (props.target === DomainType.NODE || props.includeNode) {
                    include.push('node');
                }

                if (props.target === DomainType.PROJECT || props.includeProject) {
                    include.push('project');
                }

                return { include: include as RelationsBuildInput<ProjectNode> };
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
                        'fa6-solid:hospital' :
                        'fa6-solid:file',
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
                                text = h('div', [
                                    h(FDisplayName, {
                                        name: slotProps.data.project.name,
                                        displayName: slotProps.data.project.display_name,
                                    }),
                                ]);
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

            noMore: { content: `No more ${props.target} available...` },
        });

        return () => render();
    },
});
