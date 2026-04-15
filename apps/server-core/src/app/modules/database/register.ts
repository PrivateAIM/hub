/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { DataSource } from 'typeorm';
import { NodeRepositoryAdapter } from './repositories/node/index.ts';
import { RegistryRepositoryAdapter } from './repositories/registry/index.ts';
import { MasterImageRepositoryAdapter } from './repositories/master-image/index.ts';
import { MasterImageGroupRepositoryAdapter } from './repositories/master-image-group/index.ts';
import { ProjectRepositoryAdapter } from './repositories/project/index.ts';
import { RegistryProjectRepositoryAdapter } from './repositories/registry-project/index.ts';
import { AnalysisRepositoryAdapter } from './repositories/analysis/index.ts';
import { AnalysisBucketRepositoryAdapter } from './repositories/analysis-bucket/index.ts';
import { AnalysisBucketFileRepositoryAdapter } from './repositories/analysis-bucket-file/index.ts';
import { ProjectNodeRepositoryAdapter } from './repositories/project-node/index.ts';
import { AnalysisNodeRepositoryAdapter } from './repositories/analysis-node/index.ts';
import { AnalysisPermissionRepositoryAdapter } from './repositories/analysis-permission/index.ts';
import { AnalysisNodeEventRepositoryAdapter } from './repositories/analysis-node-event/index.ts';
import { ComponentsInjectionKey } from '../components/constants.ts';
import { RegistryManagerAdapter } from '../registry/index.ts';
import { DatabaseInjectionKey } from './constants.ts';

export function registerRepositories(container: IContainer, dataSource: DataSource): void {
    container.register(DatabaseInjectionKey.NodeRepository, { useValue: new NodeRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.RegistryRepository, { useValue: new RegistryRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.MasterImageRepository, { useValue: new MasterImageRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.MasterImageGroupRepository, { useValue: new MasterImageGroupRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.ProjectRepository, { useValue: new ProjectRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.RegistryProjectRepository, { useValue: new RegistryProjectRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.AnalysisRepository, { useValue: new AnalysisRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.AnalysisBucketRepository, { useValue: new AnalysisBucketRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.AnalysisBucketFileRepository, { useValue: new AnalysisBucketFileRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.ProjectNodeRepository, { useValue: new ProjectNodeRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.AnalysisNodeRepository, { useValue: new AnalysisNodeRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.AnalysisPermissionRepository, { useValue: new AnalysisPermissionRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.AnalysisNodeEventRepository, { useValue: new AnalysisNodeEventRepositoryAdapter(dataSource) });
    const callerResult = container.tryResolve(ComponentsInjectionKey.RegistryComponentCaller);
    container.register(DatabaseInjectionKey.RegistryManager, {
        useValue: new RegistryManagerAdapter({
            dataSource,
            registryComponentCaller: callerResult.success ? callerResult.data : undefined,
        }),
    });
}
