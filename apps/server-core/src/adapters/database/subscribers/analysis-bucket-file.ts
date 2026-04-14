/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import { DomainType } from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import type { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisBucketFileEntity } from '../entities/analysis-bucket-file.ts';
import { AnalysisMetadataCommand } from '../../../core/domains/index.ts';

type MetadataCaller = {
    call(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void>;
};

export class AnalysisBucketFileSubscriber extends BaseSubscriber<
    AnalysisBucketFileEntity
> implements EntitySubscriberInterface<AnalysisBucketFileEntity> {
    protected metadataCaller?: MetadataCaller;

    constructor(ctx?: { metadataCaller?: MetadataCaller }) {
        super({
            refType: DomainType.ANALYSIS_BUCKET_FILE,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.ANALYSIS_BUCKET_FILE,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.ANALYSIS_BUCKET_FILE, data.id],
                    },
                ];

                if (data.realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: DomainType.ANALYSIS_BUCKET_FILE,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: [DomainType.ANALYSIS_BUCKET_FILE, data.id],
                    });
                }

                return destinations;
            },
        });

        this.metadataCaller = ctx?.metadataCaller;
    }

    async afterInsert(event: InsertEvent<AnalysisBucketFileEntity>): Promise<any> {
        await super.afterInsert(event);

        if (event.entity.root && this.metadataCaller) {
            await this.metadataCaller.call(
                AnalysisMetadataCommand.RECALC,
                {
                    analysisId: event.entity.analysis_id, 
                    queryNodes: false, 
                    querySelf: false, 
                },
                { entityManager: event.manager },
            );
        }
    }

    async afterUpdate(event: UpdateEvent<AnalysisBucketFileEntity>): Promise<any> {
        await super.afterUpdate(event);

        if (!this.metadataCaller) return;

        const analysisId = event.entity?.analysis_id ?? event.databaseEntity?.analysis_id;

        await this.metadataCaller.call(
            AnalysisMetadataCommand.RECALC,
            {
                analysisId, 
                queryNodes: false, 
                querySelf: false, 
            },
            { entityManager: event.manager },
        );
    }

    async afterRemove(event: RemoveEvent<AnalysisBucketFileEntity>): Promise<any> {
        if (event.entity.root && this.metadataCaller) {
            await this.metadataCaller.call(
                AnalysisMetadataCommand.RECALC,
                {
                    analysisId: event.entity.analysis_id, 
                    queryNodes: false, 
                    querySelf: false, 
                },
                { entityManager: event.manager },
            );
        }
    }

    listenTo() {
        return AnalysisBucketFileEntity;
    }
}
