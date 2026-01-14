/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent,
} from 'typeorm';
import {
    EventSubscriber,
} from 'typeorm';
import {
    DomainType,
} from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import {
    AnalysisMetadataCommand,
    useAnalysisMetadataComponentCaller,
} from '../../../components/index.ts';
import { AnalysisNodeEntity } from './entity.ts';

@EventSubscriber()
export class AnalysisNodeSubscriber extends BaseSubscriber<
AnalysisNodeEntity
> implements EntitySubscriberInterface<AnalysisNodeEntity> {
    constructor() {
        super({
            refType: DomainType.ANALYSIS_NODE,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
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

    async afterInsert(event: InsertEvent<AnalysisNodeEntity>): Promise<any> {
        await super.afterInsert(event);

        const caller = useAnalysisMetadataComponentCaller();
        Promise.resolve()
            .then(() => caller.call(
                AnalysisMetadataCommand.RECALC,
                {
                    analysisId: event.entity.analysis_id,
                    queryFiles: false,
                    querySelf: false,
                },
                {},
            ));
    }

    async afterRemove(event: RemoveEvent<AnalysisNodeEntity>): Promise<any> {
        const caller = useAnalysisMetadataComponentCaller();
        Promise.resolve()
            .then(() => caller.call(
                AnalysisMetadataCommand.RECALC,
                {
                    analysisId: event.entity.analysis_id,
                    queryFiles: false,
                    querySelf: false,
                },
                {},
            ));
    }

    listenTo(): CallableFunction | string {
        return AnalysisNodeEntity;
    }
}
