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
} from 'typeorm';
import { DomainType } from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import type { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisNodeEntity } from '../entities/anaylsis-node.ts';
import { AnalysisMetadataCommand } from '../../../app/components/index.ts';

type MetadataCaller = {
    call(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void>;
};

export class AnalysisNodeSubscriber extends BaseSubscriber<
    AnalysisNodeEntity
> implements EntitySubscriberInterface<AnalysisNodeEntity> {
    protected metadataCaller?: MetadataCaller;

    constructor(ctx?: { metadataCaller?: MetadataCaller }) {
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

        this.metadataCaller = ctx?.metadataCaller;
    }

    async afterInsert(event: InsertEvent<AnalysisNodeEntity>): Promise<any> {
        await super.afterInsert(event);

        if (!this.metadataCaller) return;

        await this.metadataCaller.call(
            AnalysisMetadataCommand.RECALC,
            {
                analysisId: event.entity.analysis_id, 
                queryFiles: false, 
                querySelf: false, 
            },
            { entityManager: event.manager },
        );
    }

    async afterRemove(event: RemoveEvent<AnalysisNodeEntity>): Promise<any> {
        const analysisId = event.entity?.analysis_id || event.databaseEntity?.analysis_id;
        if (!analysisId || !this.metadataCaller) return;

        await this.metadataCaller.call(
            AnalysisMetadataCommand.RECALC,
            {
                analysisId, 
                queryFiles: false, 
                querySelf: false, 
            },
            { entityManager: event.manager },
        );
    }

    listenTo(): CallableFunction | string {
        return AnalysisNodeEntity;
    }
}
