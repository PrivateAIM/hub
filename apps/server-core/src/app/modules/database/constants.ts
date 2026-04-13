/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { DataSource } from 'typeorm';
import type {
    IAnalysisBucketFileRepository,
    IAnalysisBucketRepository,
    IAnalysisNodeEventRepository,
    IAnalysisNodeRepository,
    IAnalysisPermissionRepository,
    IAnalysisRepository,
    IMasterImageGroupRepository,
    IMasterImageRepository,
    INodeRepository,
    IProjectNodeRepository,
    IProjectRepository,
    IRegistryManager,
    IRegistryProjectRepository,
    IRegistryRepository,
} from '../../../core/index.ts';

export const DatabaseInjectionKey = {
    DataSource: new TypedToken<DataSource>('DataSource'),

    NodeRepository: new TypedToken<INodeRepository>('NodeRepository'),
    RegistryRepository: new TypedToken<IRegistryRepository>('RegistryRepository'),
    MasterImageRepository: new TypedToken<IMasterImageRepository>('MasterImageRepository'),
    MasterImageGroupRepository: new TypedToken<IMasterImageGroupRepository>('MasterImageGroupRepository'),
    ProjectRepository: new TypedToken<IProjectRepository>('ProjectRepository'),
    RegistryProjectRepository: new TypedToken<IRegistryProjectRepository>('RegistryProjectRepository'),
    AnalysisRepository: new TypedToken<IAnalysisRepository>('AnalysisRepository'),
    AnalysisBucketRepository: new TypedToken<IAnalysisBucketRepository>('AnalysisBucketRepository'),
    AnalysisBucketFileRepository: new TypedToken<IAnalysisBucketFileRepository>('AnalysisBucketFileRepository'),
    ProjectNodeRepository: new TypedToken<IProjectNodeRepository>('ProjectNodeRepository'),
    AnalysisNodeRepository: new TypedToken<IAnalysisNodeRepository>('AnalysisNodeRepository'),
    AnalysisPermissionRepository: new TypedToken<IAnalysisPermissionRepository>('AnalysisPermissionRepository'),
    AnalysisNodeEventRepository: new TypedToken<IAnalysisNodeEventRepository>('AnalysisNodeEventRepository'),

    RegistryManager: new TypedToken<IRegistryManager>('RegistryManager'),
} as const;
