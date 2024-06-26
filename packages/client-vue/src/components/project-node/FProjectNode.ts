/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainSubType,
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import type {
    ProjectNode,
} from '@privateaim/core-kit';
import type { FiltersBuildInput } from 'rapiq';
import {
    defineComponent, h,
} from 'vue';
import type {
    PropType,
    VNodeChild,
} from 'vue';
import { createEntityManager, defineEntityManagerEvents, injectCoreHTTPClient } from '../../core';

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
        entity: {
            type: Object as PropType<ProjectNode>,
        },
        entityId: {
            type: String,
        },
        queryFilters: {
            type: Object as PropType<FiltersBuildInput<ProjectNode>>,
        },
        direction: {
            type: String as PropType<`${Direction.IN}` | `${Direction.OUT}`>,
        },
        target: {
            type: String as PropType<`${Target.NODE}` | `${Target.PROJECT}`>,
        },
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
                        return realmId === event.data.node_realm_id;
                    }

                    if (props.target === Target.NODE) {
                        return realmId === event.data.project_realm_id;
                    }

                    return false;
                },
                buildChannelName(id) {
                    if (props.direction === Direction.IN) {
                        return buildDomainChannelName(DomainSubType.PROJECT_NODE_IN, id);
                    }

                    if (props.direction === Direction.OUT) {
                        return buildDomainChannelName(DomainSubType.PROJECT_NODE_OUT, id);
                    }

                    return buildDomainChannelName(DomainType.PROJECT_NODE, id);
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
                            manager.data.value?.project.name,
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
