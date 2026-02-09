/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import { DomainType } from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisMetadataCommand, useAnalysisMetadataComponentCaller } from '../../../components/index.ts';
import { AnalysisStorageManager } from '../../../services/analysis-storage-manager/index.ts';
import { AnalysisBucketEntity } from '../analysis-bucket/index.ts';
import { AnalysisEntity } from './entity.ts';

@EventSubscriber()
export class AnalysisSubscriber extends BaseSubscriber<
AnalysisEntity
> implements EntitySubscriberInterface<AnalysisEntity> {
    constructor() {
        super({
            refType: DomainType.ANALYSIS,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.ANALYSIS,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.ANALYSIS, data.id],
                    },
                ];

                if (data.realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: DomainType.ANALYSIS,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: [DomainType.ANALYSIS, data.id],
                    });
                }

                return destinations;
            },
        });
    }

    async afterInsert(event: InsertEvent<AnalysisEntity>): Promise<any> {
        await super.afterInsert(event);

        const analysisStorageManager = new AnalysisStorageManager({
            repository: event.manager.getRepository(AnalysisEntity),
            bucketRepository: event.manager.getRepository(AnalysisBucketEntity),
        });

        await analysisStorageManager.check(event.entity);
    }

    async beforeRemove(event: RemoveEvent<AnalysisEntity>): Promise<any> {
        await super.beforeRemove(event);

        const analysisStorageManager = new AnalysisStorageManager({
            repository: event.manager.getRepository(AnalysisEntity),
            bucketRepository: event.manager.getRepository(AnalysisBucketEntity),
        });

        await analysisStorageManager.remove(event.entity);
    }

    async afterUpdate(event: UpdateEvent<AnalysisEntity>): Promise<any> {
        await super.afterUpdate(event);

        const analysisId = event.entity?.id ??
            event.databaseEntity?.id;
        if (!analysisId) {
            return;
        }

        const caller = useAnalysisMetadataComponentCaller();
        Promise.resolve()
            .then(() => caller.call(
                AnalysisMetadataCommand.RECALC,
                {
                    analysisId,
                    queryNodes: false,
                    queryFiles: false,
                },
                {},
            ));
    }

    listenTo() {
        return AnalysisEntity;
    }
}
