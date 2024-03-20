/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent, h } from 'vue';
import type { AnalysisNode } from '@privateaim/core';
import {
    DomainType,
} from '@privateaim/core';
import { createEntityManager, defineEntityManagerEvents } from '../../core';

export default defineComponent({
    props: {
        analysisId: {
            type: String,
            required: true,
        },
        nodeId: {
            type: String,
            required: true,
        },
        realmId: String,
    },
    emits: defineEntityManagerEvents<AnalysisNode>(),
    async setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.ANALYSIS_NODE}`,
            setup,
            socket: {
                processEvent(event) {
                    return event.data.analysis_id === props.analysisId &&
                        event.data.node_id === props.nodeId;
                },
            },
        });

        await manager.resolve({
            query: {
                filters: {
                    analysis_id: props.analysisId,
                    node_id: props.nodeId,
                },
            },
        });

        return () => h('button', {
            class: ['btn btn-xs', {
                'btn-success': !manager.data.value,
                'btn-danger': manager.data.value,
            }],
            onClick($event: any) {
                $event.preventDefault();

                if (manager.data.value) {
                    return manager.delete();
                }

                return manager.create({
                    analysis_id: props.analysisId,
                    node_id: props.nodeId,
                });
            },
        }, [
            h('i', {
                class: ['fa', {
                    'fa-plus': !manager.data.value,
                    'fa-minus': manager.data.value,
                }],
            }),
        ]);
    },
});
