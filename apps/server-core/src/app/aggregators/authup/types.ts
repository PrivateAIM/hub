/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import type { Client as RedisClient } from 'redis-extension';
import type { IRegistryCaller } from '../../../core/harbor/types.ts';
import type {
    IAnalysisBucketFileRepository,
    IAnalysisRepository,
    INodeRepository,
    IProjectRepository,
    IRegistryProjectRepository,
} from '../../../core/index.ts';

export type AuthupAggregatorRepositories = {
    analysisRepository: IAnalysisRepository;
    analysisBucketFileRepository: IAnalysisBucketFileRepository;
    nodeRepository: INodeRepository;
    projectRepository: IProjectRepository;
    registryProjectRepository: IRegistryProjectRepository;
};

export type AuthupAggregatorContext = AuthupAggregatorRepositories & {
    env: string;
    registryComponentCaller?: IRegistryCaller;
    redisSubscribeClient?: RedisClient;
    logger?: Logger;
};
