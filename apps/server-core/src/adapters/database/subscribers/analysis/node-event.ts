/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface,
} from 'typeorm';

import {
    DomainType,
} from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import type { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisNodeEventEntity } from '../../entities/analysis-node-event.ts';

export class AnalysisNodeEventSubscriber extends BaseSubscriber<
    AnalysisNodeEventEntity
> implements EntitySubscriberInterface<AnalysisNodeEventEntity> {
    constructor() {
        super({
            refType: DomainType.ANALYSIS_NODE_EVENT,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.ANALYSIS_NODE_EVENT,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.ANALYSIS_NODE_EVENT, data.id],
                    },
                ];

                if (data.analysisRealmId) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.analysisRealmId],
                        channel: DomainType.ANALYSIS_NODE_EVENT,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.analysisRealmId],
                        channel: [DomainType.ANALYSIS_NODE_EVENT, data.id],
                    });
                }

                if (data.nodeRealmId) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.nodeRealmId],
                        channel: DomainType.ANALYSIS_NODE_EVENT,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.nodeRealmId],
                        channel: [DomainType.ANALYSIS_NODE_EVENT, data.id],
                    });
                }

                return destinations;
            },
        });
    }

    listenTo(): CallableFunction | string {
        return AnalysisNodeEventEntity;
    }
}
