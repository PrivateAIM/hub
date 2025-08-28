/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import {
    DomainType,
} from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisNodeEventEntity } from './entity';

@EventSubscriber()
export class AnalysisNodeEventSubscriber extends BaseSubscriber<
AnalysisNodeEventEntity
> implements EntitySubscriberInterface<AnalysisNodeEventEntity> {
    constructor() {
        super({
            domain: DomainType.ANALYSIS_NODE_EVENT,
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

                if (data.analysis_realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.analysis_realm_id],
                        channel: DomainType.ANALYSIS_NODE_EVENT,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.analysis_realm_id],
                        channel: [DomainType.ANALYSIS_NODE_EVENT, data.id],
                    });
                }

                if (data.node_realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.node_realm_id],
                        channel: DomainType.ANALYSIS_NODE_EVENT,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.node_realm_id],
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
