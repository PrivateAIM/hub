/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { BucketBaseComponent } from '@privateaim/server-storage-kit';
import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import {
    AnalysisBucketType, DomainType,
    buildAnalysisBucketName,
} from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisMetadataCommand, useAnalysisMetadataComponent } from '../../../components';
import { AnalysisBucketEntity } from '../analysis-bucket';
import { AnalysisEntity } from './entity';

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

        const bucketComponent = new BucketBaseComponent();
        const bucketTypes = Object.values(AnalysisBucketType);
        for (let i = 0; i < bucketTypes.length; i++) {
            await bucketComponent.triggerCreate({
                name: buildAnalysisBucketName(bucketTypes[i], event.entity.id),
            }, {
                analysisId: event.entity.id,
                bucketType: bucketTypes[i],
            });
        }
    }

    async beforeRemove(event: RemoveEvent<AnalysisEntity>): Promise<any> {
        await super.beforeRemove(event);

        const bucketComponent = new BucketBaseComponent();

        const analysisBucketRepository = event.manager.getRepository(AnalysisBucketEntity);
        const analysisBuckets = await analysisBucketRepository.find({
            where: {
                analysis_id: event.entity.id,
            },
        });

        for (let i = 0; i < analysisBuckets.length; i++) {
            const analysisBucket = analysisBuckets[i];
            // todo: remove condition
            if (!analysisBucket.external_id) {
                continue;
            }

            await bucketComponent.triggerDelete({
                id: analysisBucket.external_id,
            }, {
                analysisId: analysisBucket.analysis_id,
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

        const analysisConfiguration = useAnalysisMetadataComponent();
        analysisConfiguration.trigger(
            AnalysisMetadataCommand.RECALC,
            {
                analysisId,
            },
        );
    }

    listenTo() {
        return AnalysisEntity;
    }
}
