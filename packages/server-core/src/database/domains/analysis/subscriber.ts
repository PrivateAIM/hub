/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { BucketComponentCaller } from '@privateaim/server-storage-kit';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import { AnalysisBucketType, DomainType, buildAnalysisBucketName } from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisMetadataCommand, useAnalysisMetadataComponentCaller } from '../../../components/index.ts';
import { AnalysisBucketEntity } from '../analysis-bucket/index.ts';
import { AnalysisEntity } from './entity.ts';
import { TaskType, useTaskManager } from '../../../domains/index.ts';

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

        const taskManager = useTaskManager();

        const bucketComponentCaller = new BucketComponentCaller();
        const bucketTypes = Object.values(AnalysisBucketType);

        for (let i = 0; i < bucketTypes.length; i++) {
            // todo: maybe extract actor_id, actor_type from event.queryRunner.data
            const correlationId = await taskManager.create(
                TaskType.ANALYSIS_BUCKET_CREATE,
                {
                    analysisId: event.entity.id,
                    bucketType: bucketTypes[i],
                },
            );

            await bucketComponentCaller.callCreate({
                name: buildAnalysisBucketName(bucketTypes[i], event.entity.id),
                realm_id: event.entity.realm_id,
            }, {
                correlationId,
            });
        }
    }

    async beforeRemove(event: RemoveEvent<AnalysisEntity>): Promise<any> {
        await super.beforeRemove(event);

        const taskManager = useTaskManager();
        const bucketComponentCaller = new BucketComponentCaller();

        const analysisBucketRepository = event.manager.getRepository(AnalysisBucketEntity);
        const analysisBuckets = await analysisBucketRepository.find({
            where: {
                analysis_id: event.entity.id,
            },
        });

        for (let i = 0; i < analysisBuckets.length; i++) {
            const analysisBucket = analysisBuckets[i];

            const correlationId = await taskManager.create(
                TaskType.ANALYSIS_BUCKET_DELETE,
                {
                    analysisId: analysisBucket.analysis_id,
                },
            );

            await bucketComponentCaller.callDelete({
                id: analysisBucket.bucket_id,
            }, {
                correlationId,
            });
        }
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
