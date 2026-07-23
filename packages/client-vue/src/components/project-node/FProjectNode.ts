/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainEventSubscriptionName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import type {
    ProjectNode,
} from '@privateaim/core-kit';
import { buildDomainEventFullName } from '@privateaim/kit';
import type { FiltersBuildInput } from '@rapiq/core';
import {
    defineComponent, 
    h,
} from 'vue';
import type {
    PropType,
    VNodeChild,
} from 'vue';
import { createEntityManager, defineEntityManagerEvents, injectCoreHTTPClient } from '../../core';
import FDisplayName from '../FDisplayName';

enum Direction {
    IN = 'in',
    OUT = 'out',
}

enum Target {
    PROJECT = 'project',
    NODE = 'node',
}

export default defineComponent({
    props: {
        entity: { type: Object as PropType<ProjectNode> },
        entityId: { type: String },
        queryFilters: { type: Object as PropType<FiltersBuildInput<ProjectNode, 3>> },
        direction: { type: String as PropType<`${Direction.IN}` | `${Direction.OUT}`> },
        target: { type: String as PropType<`${Target.NODE}` | `${Target.PROJECT}`> },
    },
    emits: defineEntityManagerEvents<ProjectNode>(),
    async setup(props, setup) {
        const apiClient = injectCoreHTTPClient();
        const manager = createEntityManager({
            realmId: (entity) => {
                if (!entity) {
                    return undefined;
                }

                if (props.target === Target.PROJECT) {
                    return entity.project_realm_id;
                }

                if (props.target === Target.NODE) {
                    return entity.node_realm_id;
                }

                return undefined;
            },
            type: `${DomainType.PROJECT_NODE}`,
            setup,
            props,
            socket: {
                processEvent(event, realmId) {
                    if (!realmId) {
                        return true;
                    }

                    if (props.target === Target.PROJECT) {
                        return realmId === event.data.project_realm_id;
                    }

                    if (props.target === Target.NODE) {
                        return realmId === event.data.node_realm_id;
                    }

                    return false;
                },
                // Events are emitted to the base entity room within the realm namespace;
                // realm scoping is enforced by the namespace and the realmId check above.
                buildChannelName(id) {
                    return buildDomainChannelName(DomainType.PROJECT_NODE, id);
                },
                // Match the subscribe event to the namespace createEntitySocket connects to:
                // directional handlers exist only in realm namespaces, the base handler only at root.
                buildSubscribeEventName(realmId) {
                    if (realmId) {
                        return buildDomainEventFullName(
                            props.direction === Direction.IN ?
                                DomainSubType.PROJECT_NODE_IN :
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
                        return buildDomainEventFullName(
                            props.direction === Direction.IN ?
                                DomainSubType.PROJECT_NODE_IN :
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
        });

        await manager.resolve();

        if (
            manager.data.value &&
            props.target &&
            !manager.data.value[props.target]
        ) {
            if (props.target === Target.PROJECT) {
                manager.data.value[props.target] = await apiClient
                    .project.getOne(manager.data.value.project_id);
            } else {
                manager.data.value[props.target] = await apiClient
                    .node.getOne(manager.data.value.node_id);
            }
        }

        return () => {
            const fallback = () : VNodeChild => {
                if (
                    props.target &&
                    manager.data.value &&
                    manager.data.value[props.target]
                ) {
                    if (props.target === Target.PROJECT) {
                        return h('div', [
                            h(FDisplayName, {
                                name: manager.data.value?.project.name,
                                displayName: manager.data.value?.project.display_name,
                            }),
                        ]);
                    }
                    if (props.target === Target.NODE) {
                        return h('div', [
                            manager.data.value?.node.name,
                        ]);
                    }
                }

                return [
                    manager.data?.value?.id,
                ];
            };

            return manager.render(fallback);
        };
    },
});
