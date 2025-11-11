/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { ProcessStatus } from '@privateaim/kit';
import {
    AnalysisAPICommand,
    AnalysisNodeApprovalStatus,
    NodeType,
    isAnalysisAPICommandExecutable,
} from '@privateaim/core-kit';
import {
    AnalysisBuilderBaseComponent,
    AnalysisDistributorBaseComponent,
} from '@privateaim/server-core-worker-kit';
import type { Request } from 'routup';
import { useDataSource } from 'typeorm-extension';
import type { Repository } from 'typeorm';
import {
    AnalysisBucketFileEntity,
    AnalysisEntity,
    AnalysisNodeEntity,
    RegistryEntity,
    useDataSourceSync,
} from '../../database';
import { RequestRepositoryAdapter } from '../../http/request';
import type { AnalysisManagerLockOptions, AnalysisManagerUnlockOptions } from './types';

export class AnalysisManagerService {
    protected repository: Repository<AnalysisEntity>;

    protected analysisNodeRepository: Repository<AnalysisNodeEntity>;

    protected analysisBucketFileRepository: Repository<AnalysisBucketFileEntity>;

    protected registryRepository: Repository<RegistryEntity>;

    protected builderComponent : AnalysisBuilderBaseComponent;

    protected distributorComponent : AnalysisDistributorBaseComponent;

    constructor() {
        const dataSource = useDataSourceSync();

        this.repository = dataSource.getRepository(AnalysisEntity);
        this.analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
        this.analysisBucketFileRepository = dataSource.getRepository(AnalysisBucketFileEntity);

        this.registryRepository = dataSource.getRepository(RegistryEntity);

        this.builderComponent = new AnalysisBuilderBaseComponent();
        this.distributorComponent = new AnalysisDistributorBaseComponent();
    }

    async startBuild(
        input: string | AnalysisEntity,
        request?: Request,
    ): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);

        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_START);
        if (!check.success) {
            throw new BadRequestError(check.message);
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

        entity.build_status = ProcessStatus.STARTING;

        if (request) {
            const requestRepository = new RequestRepositoryAdapter(
                request,
                this.repository,
            );

            await requestRepository.save(entity);
        } else {
            await this.repository.save(entity);
        }

        await this.builderComponent.triggerExecute({
            id: entity.id,
        });

        return entity;
    }

    async startDistribution(
        input: string | AnalysisEntity,
        request?: Request,
    ) {
        const entity = await this.resolve(input);

        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.DISTRIBUTION_START);
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

        entity.distribution_status = ProcessStatus.STARTING;

        if (request) {
            const requestRepository = new RequestRepositoryAdapter(
                request,
                this.repository,
            );

            await requestRepository.save(entity);
        } else {
            await this.repository.save(entity);
        }

        await this.distributorComponent.triggerExecute({
            id: entity.id,
        });

        return entity;
    }

    async checkBuild(
        input: string | AnalysisEntity,
    ): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);
        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_STATUS);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        await this.builderComponent.triggerCheck({
            id: entity.id,
        });

        return entity;
    }

    async stopBuild(
        input: string | AnalysisEntity,
        request?: Request,
    ): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);

        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_STOP);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        entity.build_status = entity.build_status !== ProcessStatus.STOPPING ?
            ProcessStatus.STOPPING :
            ProcessStatus.STOPPED;

        if (request) {
            const requestRepository = new RequestRepositoryAdapter(
                request,
                this.repository,
            );

            await requestRepository.save(entity);
        } else {
            await this.repository.save(entity);
        }

        return entity;
    }

    /**
     * Lock the analysis configuration.
     * The analysis and related resources become immutable and can not be changed.
     *
     * @param input
     * @param options
     */
    async lock(
        input: string | AnalysisEntity,
        options: AnalysisManagerLockOptions = {},
    ): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);
        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.CONFIGURATION_LOCK);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        entity.configuration_locked = true;

        if (options.request) {
            const requestRepository = new RequestRepositoryAdapter(
                options.request,
                this.repository,
            );

            await requestRepository.save(entity);
        } else {
            await this.repository.save(entity);
        }

        return entity;
    }

    /**
     * Un the analysis configuration.
     * The analysis and related resources become mutable and can be changed again.
     *
     * @param input
     * @param options
     */
    async unlock(
        input: string | AnalysisEntity,
        options : AnalysisManagerUnlockOptions = {},
    ): Promise<AnalysisEntity> {
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

        if (options.request) {
            const requestRepository = new RequestRepositoryAdapter(
                options.request,
                this.repository,
            );

            await requestRepository.save(entity);
        } else {
            await this.repository.save(entity);
        }

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
