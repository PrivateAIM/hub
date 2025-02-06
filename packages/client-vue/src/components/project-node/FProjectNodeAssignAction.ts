/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent } from 'vue';
import type { ProjectNode } from '@privateaim/core-kit';
import {
    DomainType,
} from '@privateaim/core-kit';
import { createEntityManager, defineEntityManagerEvents } from '../../core';
import { renderToggleButton } from '../utility';

export default defineComponent({
    props: {
        projectId: {
            type: String,
            required: true,
        },
        nodeId: {
            type: String,
            required: true,
        },
        realmId: String,
    },
    emits: defineEntityManagerEvents<ProjectNode>(),
    async setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.PROJECT_NODE}`,
            realmId: props.realmId,
            setup,
            socket: {
                processEvent(event) {
                    return event.data.project_id === props.projectId &&
                        event.data.node_id === props.nodeId;
                },
            },
        });

        await manager.resolve({
            query: {
                filters: {
                    project_id: props.projectId,
                    node_id: props.nodeId,
                },
            },
        });

        return () => renderToggleButton({
            isBusy: manager.busy.value,
            value: !!manager.data.value,
            changed: (value) => {
                if (value) {
                    return manager.create({
                        project_id: props.projectId,
                        node_id: props.nodeId,
                    });
                }

                return manager.delete();
            },
        });
    },
});
