/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import {
    AnalysisAPICommand, AnalysisBucketType, AnalysisBuildStatus,
    AnalysisNodeApprovalStatus, NodeType, isAnalysisAPICommandExecutable,
} from '@privateaim/core-kit';
import {
    BuilderCommand,
    CoreCommand,
    buildBuilderTaskQueueRouterPayload, buildCoreTaskQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';
import { useDataSource } from 'typeorm-extension';
import type { QueueRouter } from '@privateaim/server-kit';
import { useQueueRouter } from '@privateaim/server-kit';
import type { Repository } from 'typeorm';
import {
    AnalysisBucketEntity,
    AnalysisBucketFileEntity,
    AnalysisEntity,
    AnalysisNodeEntity,
    RegistryEntity, useDataSourceSync,
} from '../../database';
import type { AnalysisManagerLockOptions, AnalysisManagerUnlockOptions } from './types';

export class AnalysisManagerService {
    protected repository: Repository<AnalysisEntity>;

    protected analysisNodeRepository: Repository<AnalysisNodeEntity>;

    protected analysisBucketRepository: Repository<AnalysisBucketEntity>;

    protected analysisBucketFileRepository: Repository<AnalysisBucketFileEntity>;

    protected registryRepository: Repository<RegistryEntity>;

    protected queueRouter: QueueRouter;

    constructor() {
        const dataSource = useDataSourceSync();

        this.repository = dataSource.getRepository(AnalysisEntity);
        this.analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
        this.analysisBucketRepository = dataSource.getRepository(AnalysisBucketEntity);
        this.analysisBucketFileRepository = dataSource.getRepository(AnalysisBucketFileEntity);

        this.registryRepository = dataSource.getRepository(RegistryEntity);
        this.queueRouter = useQueueRouter();
    }

    async startDistribution(input: string | AnalysisEntity): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);

        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_START);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        const analysisNodes = await this.analysisNodeRepository.find({
            where: {
                analysis_id: entity.id,
            },
            relations: ['node'],
        });

        for (let i = 0; i < analysisNodes.length; i++) {
            if (analysisNodes[i].approval_status !== AnalysisNodeApprovalStatus.APPROVED) {
                throw new BadRequestError('Not all nodes have approved the analysis yet.');
            }

            if (
                analysisNodes[i].node &&
                !analysisNodes[i].node.registry_id
            ) {
                throw new BadRequestError(`The node ${analysisNodes[i].node.name} is not assigned to a registry yet.`);
            }
        }

        if (!entity.registry_id) {
            const [registry] = await this.registryRepository.find({
                take: 1,
            });

            if (!registry) {
                throw new BadRequestError('No registry is registered.');
            }

            entity.registry_id = registry.id;
        }

        entity.build_status = AnalysisBuildStatus.STARTING;

        await this.repository.save(entity);
        await this.queueRouter.publish(buildBuilderTaskQueueRouterPayload({
            command: BuilderCommand.BUILD,
            data: {
                id: entity.id,
            },
        }));

        return entity;
    }

    async checkDistribution(input: string | AnalysisEntity): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);
        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_STATUS);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        await this.queueRouter.publish(buildBuilderTaskQueueRouterPayload({
            command: BuilderCommand.CHECK,
            data: {
                id: entity.id,
            },
        }));

        return entity;
    }

    async stopDistribution(input: string | AnalysisEntity): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);

        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_STOP);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        entity.build_status = entity.build_status !== AnalysisBuildStatus.STOPPING ?
            AnalysisBuildStatus.STOPPING :
            AnalysisBuildStatus.STOPPED;

        await this.repository.save(entity);

        return entity;
    }

    async lock(input: string | AnalysisEntity, options: AnalysisManagerLockOptions = {}): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);
        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.CONFIGURATION_LOCK);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        const analysisBucket = await this.analysisBucketRepository.findOneBy({
            type: AnalysisBucketType.CODE,
            analysis_id: entity.id,
        });
        if (!analysisBucket) {
            throw new BadRequestError('The analysis bucket for code files does not exist.');
        }

        const analysisFile = await this.analysisBucketFileRepository.findOneBy({
            root: true,
            bucket_id: analysisBucket.id,
        });
        if (!analysisFile) {
            throw new BadRequestError('At least one code file must be uploaded and at least one entrypoint file is required.');
        }

        const analysisNodes = await this.analysisNodeRepository.find({
            where: {
                analysis_id: entity.id,
            },
            relations: ['node'],
        });

        let aggregatorNodes = 0;

        for (let i = 0; i < analysisNodes.length; i++) {
            if (
                !options.ignoreApproval &&
                analysisNodes[i].approval_status !== AnalysisNodeApprovalStatus.APPROVED
            ) {
                throw new BadRequestError('At least one node has not approved the analysis.');
            }

            if (
                analysisNodes[i].node &&
                analysisNodes[i].node.type === NodeType.AGGREGATOR
            ) {
                aggregatorNodes++;
            }
        }

        if (aggregatorNodes > 1) {
            throw new BadRequestError('Only one aggregator node can be part of the analysis.');
        }

        if (aggregatorNodes === 0) {
            throw new BadRequestError('At least one aggregator node has to be part of the analysis.');
        }

        entity.configuration_locked = true;
        await this.repository.save(entity);

        return entity;
    }

    async unlock(input: string | AnalysisEntity, options : AnalysisManagerUnlockOptions = {}): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);

        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.CONFIGURATION_UNLOCK);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        const analysisNodes = await this.analysisNodeRepository.find({
            where: {
                analysis_id: entity.id,
            },
            relations: ['node'],
        });

        for (let i = 0; i < analysisNodes.length; i++) {
            if (
                analysisNodes[i].node &&
                analysisNodes[i].node.type === NodeType.AGGREGATOR
            ) {
                continue;
            }

            if (!options.ignoreApproval) {
                analysisNodes[i].approval_status = null;
            }

            await this.analysisNodeRepository.save(analysisNodes[i]);
        }

        entity.configuration_locked = false;
        entity.build_status = null;

        await this.repository.save(entity);

        return entity;
    }

    async spinUp(input: string | AnalysisEntity): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);

        const message = buildCoreTaskQueueRouterPayload({
            command: CoreCommand.CONFIGURE,
            data: {
                id: entity.id,
            },
        });

        await this.queueRouter.publish(message);

        return entity;
    }

    async tearDown(input: string | AnalysisEntity): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);

        const message = buildCoreTaskQueueRouterPayload({
            command: CoreCommand.DESTROY,
            data: {
                id: entity.id,
            },
        });

        await this.queueRouter.publish(message);

        return entity;
    }

    // ---------------------------------------------------------------

    protected async resolve(input: string | AnalysisEntity) : Promise<AnalysisEntity> {
        if (typeof input === 'string') {
            const dataSource = await useDataSource();
            const repository = dataSource.getRepository(AnalysisEntity);

            const entity = await repository.findOneBy({ id: input });
            if (!entity) {
                throw new BadRequestError('Analysis could not be found.');
            }

            return entity;
        }

        return input;
    }
}
