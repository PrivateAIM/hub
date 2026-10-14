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
    AnalysisNodeEventRepository: new TypedToken<IAnalysisNodeEventRepository>('AnalysisNodeEventRepository'),

    RegistryManager: new TypedToken<IRegistryManager>('RegistryManager'),
} as const;

/**
 * The mutex a boot-time (or CLI) migration run holds against every other, so
 * replicas booting at once apply the pending migrations once instead of
 * racing on the same tables. The name must stay STABLE across releases: a
 * renamed lock is a different mutex, so an outgoing and an incoming replica
 * would not wait for each other during a rolling upgrade.
 */
export const MIGRATION_DATABASE_LOCK = 'server-core:migration';
