/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import type { EventEntity } from '../../../database';
import { AnalysisNodeEventEntity } from '../../../database';
import type { EventServiceHook, EventServiceHookContext } from '../types';

export class EventServiceAnalysisNodeHook implements EventServiceHook {
    async pre(input: EventEntity<Partial<AnalysisNodeEvent>>): Promise<void> {
        if (input.data) {
            if (input.data.node) {
                input.data.node_id = input.data.node.id;
                input.data.node_realm_id = input.data.node.realm_id;

                delete input.data.node;
            }

            if (input.data.analysis) {
                input.data.analysis_id = input.data.analysis.id;
                input.data.analysis_realm_id = input.data.analysis.realm_id;

                delete input.data.analysis;
            }
        }
    }

    async post(input: EventEntity<Partial<AnalysisNodeEvent>>, context: EventServiceHookContext): Promise<void> {
        if (!input.data.node_id && !input.data.analysis_id) {
            return;
        }

        const repository = context.entityManager.getRepository(AnalysisNodeEventEntity);

        const entity = repository.create({
            event: input,
            event_id: input.id,
            node_id: input.data.node_id,
            node_realm_id: input.data.node_realm_id,
            analysis_id: input.data.analysis_id,
            analysis_realm_id: input.data.analysis_realm_id,
        });

        await repository.insert(entity);
    }
}
