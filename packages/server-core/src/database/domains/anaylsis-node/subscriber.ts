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
    EventSubscriber,
} from 'typeorm';
import {
    DomainType,
} from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { DomainEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisNodeEntity } from './entity';

@EventSubscriber()
export class AnalysisNodeSubscriber extends BaseSubscriber<
AnalysisNodeEntity
> implements EntitySubscriberInterface<AnalysisNodeEntity> {
    constructor() {
        super({
            domain: DomainType.ANALYSIS_NODE,
            destinations: (data) => {
                const destinations: DomainEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.ANALYSIS_NODE,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.ANALYSIS_NODE, data.id],
                    },
                ];

                if (data.analysis_realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.analysis_realm_id],
                        channel: DomainType.ANALYSIS_NODE,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.analysis_realm_id],
                        channel: [DomainType.ANALYSIS_NODE, data.id],
                    });
                }

                if (data.node_realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.node_realm_id],
                        channel: DomainType.ANALYSIS_NODE,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.node_realm_id],
                        channel: [DomainType.ANALYSIS_NODE, data.id],
                    });
                }

                return destinations;
            },
        });
    }

    listenTo(): CallableFunction | string {
        return AnalysisNodeEntity;
    }
}
