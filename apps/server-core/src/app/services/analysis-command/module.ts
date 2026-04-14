/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisBuilderComponentCaller, AnalysisDistributorComponentCaller } from '@privateaim/server-core-worker-kit';
import { BucketComponentCaller } from '@privateaim/server-storage-kit';
import { useDataSourceSync } from '../../modules/database/singleton.ts';
import { useAnalysisMetadataComponentCaller } from '../../components/index.ts';
import { AnalysisBuilder } from '../../../core/services/analysis-builder/index.ts';
import { AnalysisConfigurator } from '../../../core/services/analysis-configurator/index.ts';
import { AnalysisDistributor } from '../../../core/services/analysis-distributor/index.ts';
import { AnalysisStorageManager } from '../../../core/services/analysis-storage-manager/index.ts';
import { useTaskManager } from '../../../core/domains/index.ts';
import { 
    AnalysisBucketEntity, 
    AnalysisEntity, 
    AnalysisNodeEntity, 
    RegistryEntity, 
} from '../../../adapters/database/index.ts';

function wrapRepository<T>(repo: any) {
    return {
        findMany: () => { throw new Error('Not implemented'); },
        findOneById: (id: string) => repo.findOneBy({ id }),
        findOneBy: (where: Record<string, any>) => repo.findOneBy(where),
        findManyBy: (where: Record<string, any>) => repo.findBy(where),
        create: (data: Partial<T>) => repo.create(data) as T,
        merge: (entity: T, data: Partial<T>) => repo.merge(entity, data) as T,
        save: (entity: T, ctx?: any) => repo.save(entity, ctx),
        remove: async (entity: T, ctx?: any) => { await repo.remove(entity, ctx); },
        validateJoinColumns: () => Promise.resolve(),
    };
}

export function createAnalysisBuilder(): AnalysisBuilder {
    const dataSource = useDataSourceSync();
    return new AnalysisBuilder({
        repository: wrapRepository(dataSource.getRepository(AnalysisEntity)),
        caller: new AnalysisBuilderComponentCaller(),
        metadataCaller: useAnalysisMetadataComponentCaller(),
    });
}

export function createAnalysisConfigurator(): AnalysisConfigurator {
    const dataSource = useDataSourceSync();
    return new AnalysisConfigurator({
        repository: wrapRepository(dataSource.getRepository(AnalysisEntity)),
        analysisNodeRepository: wrapRepository(dataSource.getRepository(AnalysisNodeEntity)),
        metadataCaller: useAnalysisMetadataComponentCaller(),
    });
}

export function createAnalysisDistributor(): AnalysisDistributor {
    const dataSource = useDataSourceSync();
    return new AnalysisDistributor({
        repository: wrapRepository(dataSource.getRepository(AnalysisEntity)),
        analysisNodeRepository: wrapRepository(dataSource.getRepository(AnalysisNodeEntity)),
        registryRepository: wrapRepository(dataSource.getRepository(RegistryEntity)),
        caller: new AnalysisDistributorComponentCaller(),
        metadataCaller: useAnalysisMetadataComponentCaller(),
    });
}

export function createAnalysisStorageManagerFromDataSource() {
    const dataSource = useDataSourceSync();
    return new AnalysisStorageManager({
        repository: wrapRepository(dataSource.getRepository(AnalysisEntity)),
        bucketRepository: wrapRepository(dataSource.getRepository(AnalysisBucketEntity)),
        caller: new BucketComponentCaller(),
        taskManager: useTaskManager(),
    });
}
