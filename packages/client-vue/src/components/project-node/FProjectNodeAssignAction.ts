/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent, h } from 'vue';
import type { ProjectNode } from '@privateaim/core-kit';
import {
    DomainType,
} from '@privateaim/core-kit';
import { createEntityManager, defineEntityManagerEvents } from '../../core';
import { AToggleButton } from '@authup/client-web-kit';

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
        realmId: { type: String },
        withPrompt: {
            type: Boolean,
            default: true,
        },
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

        // withPrompt confirms only the removal transition (assigned →
        // un-assign) via useAlertDialog(); adding a node never prompts.
        return () => h(AToggleButton, {
            isBusy: manager.busy.value,
            value: !!manager.data.value,
            withPrompt: props.withPrompt,
            onChanged: (value: boolean) => {
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
