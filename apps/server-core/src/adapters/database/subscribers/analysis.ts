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
    Repository, 
    UpdateEvent, 
} from 'typeorm';
import type { Analysis, AnalysisBucket } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import type { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import type { IEntityRepository } from '../../../core/entities/types.ts';
import { AnalysisMetadataCommand } from '../../../core/domains/index.ts';
import { AnalysisStorageManager } from '../../../core/services/analysis-storage-manager/index.ts';
import type { IBucketCaller, ITaskManager } from '../../../core/services/analysis-storage-manager/types.ts';
import { AnalysisBucketEntity } from '../entities/analysis-bucket.ts';
import { AnalysisEntity } from '../entities/analysis.ts';

type AnalysisMetadataCaller = {
    call(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void>;
};

type AnalysisSubscriberContext = {
    metadataCaller?: AnalysisMetadataCaller;
    bucketCaller?: IBucketCaller;
    taskManager?: ITaskManager;
};

function wrapRepo<T>(repo: Repository<T>): IEntityRepository<T> {
    return {
        findMany: () => { throw new Error('Not implemented'); },
        findOneById: (id: string) => repo.findOneBy({ id } as any),
        findOneBy: (where: Record<string, any>) => repo.findOneBy(where as any),
        findManyBy: (where: Record<string, any>) => repo.findBy(where as any),
        create: (data: Partial<T>) => repo.create(data as any) as T,
        merge: (entity: T, data: Partial<T>) => repo.merge(entity as any, data as any) as T,
        save: (entity: T, ctx?: any) => repo.save(entity as any, ctx) as Promise<T>,
        remove: async (entity: T, ctx?: any) => { await repo.remove(entity as any, ctx); },
        validateJoinColumns: () => Promise.resolve(),
    };
}

export class AnalysisSubscriber extends BaseSubscriber<
    AnalysisEntity
> implements EntitySubscriberInterface<AnalysisEntity> {
    protected metadataCaller?: AnalysisMetadataCaller;

    protected bucketCaller?: IBucketCaller;

    protected taskManager?: ITaskManager;

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
        this.bucketCaller = ctx?.bucketCaller;
        this.taskManager = ctx?.taskManager;
    }

    async afterInsert(event: InsertEvent<AnalysisEntity>): Promise<any> {
        await super.afterInsert(event);

        const storageManager = this.createStorageManager(event.manager);
        if (storageManager) {
            await storageManager.check(event.entity);
        }
    }

    async beforeRemove(event: RemoveEvent<AnalysisEntity>): Promise<any> {
        await super.beforeRemove(event);

        const storageManager = this.createStorageManager(event.manager);
        if (storageManager) {
            await storageManager.remove(event.entity);
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

    private createStorageManager(manager: any): AnalysisStorageManager | null {
        if (!this.bucketCaller || !this.taskManager) return null;

        return new AnalysisStorageManager({
            repository: wrapRepo<Analysis>(manager.getRepository(AnalysisEntity)),
            bucketRepository: wrapRepo<AnalysisBucket>(manager.getRepository(AnalysisBucketEntity)),
            caller: this.bucketCaller,
            taskManager: this.taskManager,
        });
    }
}
