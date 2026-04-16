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
import { AnalysisMetadataCommand } from '../../../../core/domains/index.ts';
import { AnalysisEntity } from '../../entities/analysis.ts';



import type { IAnalysisMetadataCaller, IAnalysisStorageManager } from './types.ts';

type AnalysisSubscriberContext = {
    metadataCaller?: IAnalysisMetadataCaller;
    storageManager?: IAnalysisStorageManager;
};

export class AnalysisSubscriber extends BaseSubscriber<
    AnalysisEntity
> implements EntitySubscriberInterface<AnalysisEntity> {
    protected metadataCaller?: IAnalysisMetadataCaller;

    protected storageManager?: IAnalysisStorageManager;

    constructor(ctx?: AnalysisSubscriberContext) {
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

        this.metadataCaller = ctx?.metadataCaller;
        this.storageManager = ctx?.storageManager;
    }

    setMetadataCaller(metadataCaller: IAnalysisMetadataCaller): void {
        this.metadataCaller = metadataCaller;
    }

    setStorageManager(storageManager: IAnalysisStorageManager): void {
        this.storageManager = storageManager;
    }

    async afterInsert(event: InsertEvent<AnalysisEntity>): Promise<any> {
        await super.afterInsert(event);

        if (this.storageManager) {
            await this.storageManager.check(event.entity);
        }
    }

    async beforeRemove(event: RemoveEvent<AnalysisEntity>): Promise<any> {
        await super.beforeRemove(event);

        if (this.storageManager) {
            await this.storageManager.remove(event.entity);
        }
    }

    async afterUpdate(event: UpdateEvent<AnalysisEntity>): Promise<any> {
        await super.afterUpdate(event);

        const analysisId = event.entity?.id ?? event.databaseEntity?.id;
        if (!analysisId || !this.metadataCaller) {
            return;
        }

        await this.metadataCaller.call(
            AnalysisMetadataCommand.RECALC,
            {
                analysisId,
                queryNodes: false,
                queryFiles: false,
            },
            { entityManager: event.manager },
        );
    }

    listenTo() {
        return AnalysisEntity;
    }
}
