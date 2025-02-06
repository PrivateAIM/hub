/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent } from 'vue';
import type { AnalysisNode } from '@privateaim/core-kit';
import {
    DomainType,
} from '@privateaim/core-kit';
import { createEntityManager, defineEntityManagerEvents } from '../../core';
import { renderToggleButton } from '../utility';

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

        return () => renderToggleButton({
            isBusy: manager.busy.value,
            value: !!manager.data.value,
            changed: (value) => {
                if (value) {
                    return manager.create({
                        analysis_id: props.analysisId,
                        node_id: props.nodeId,
                    });
                }

                return manager.delete();
            },
        });
    },
});
