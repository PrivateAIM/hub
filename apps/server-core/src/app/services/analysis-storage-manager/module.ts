/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, AnalysisBucket } from '@privateaim/core-kit';
import { BucketComponentCaller } from '@privateaim/server-storage-kit';
import type { Repository } from 'typeorm';
import { AnalysisStorageManager } from '../../../core/services/analysis-storage-manager/index.ts';
import type { IEntityRepository } from '../../../core/entities/types.ts';
import { useTaskManager } from '../../../core/domains/index.ts';

/**
 * Wraps a TypeORM Repository to satisfy IEntityRepository (partial).
 * Used as a bridge until subscribers are refactored to use DI.
 */
function wrapRepository<T>(repo: Repository<T>): IEntityRepository<T> {
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

export function createAnalysisStorageManager(
    analysisRepo: Repository<Analysis>,
    bucketRepo: Repository<AnalysisBucket>,
): AnalysisStorageManager {
    return new AnalysisStorageManager({
        repository: wrapRepository(analysisRepo),
        bucketRepository: wrapRepository(bucketRepo),
        caller: new BucketComponentCaller(),
        taskManager: useTaskManager(),
    });
}
