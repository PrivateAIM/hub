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
    isAnalysisAPICommandExecutable,
} from '@privateaim/core-kit';
import {
    AnalysisDistributorComponentCaller,
} from '@privateaim/server-core-worker-kit';
import type { Request } from 'routup';
import { useDataSource } from 'typeorm-extension';
import type { Repository } from 'typeorm';
import {
    AnalysisEntity,
    AnalysisNodeEntity, RegistryEntity,
    useDataSourceSync,
} from '../../database';
import { RequestRepositoryAdapter } from '../../http/request';

export class AnalysisDistributor {
    protected repository: Repository<AnalysisEntity>;

    protected analysisNodeRepository: Repository<AnalysisNodeEntity>;

    protected registryRepository: Repository<RegistryEntity>;

    protected caller : AnalysisDistributorComponentCaller;

    constructor() {
        const dataSource = useDataSourceSync();

        this.repository = dataSource.getRepository(AnalysisEntity);
        this.analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
        this.registryRepository = dataSource.getRepository(RegistryEntity);

        this.caller = new AnalysisDistributorComponentCaller();
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

        await this.assignRegistry(entity);

        await this.checkNodes(entity);

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

        await this.caller.callExecute({
            id: entity.id,
        });

        return entity;
    }

    // ---------------------------------------------------------------

    protected async assignRegistry(entity: AnalysisEntity) {
        if (!entity.registry_id) {
            const [registry] = await this.registryRepository.find({
                take: 1,
            });

            if (!registry) {
                throw new BadRequestError('No registry is registered.');
            }

            entity.registry_id = registry.id;
        }

        return entity;
    }

    /**
     * todo: move this to metadata component.
     *
     * @param entity
     * @protected
     */
    protected async checkNodes(entity: AnalysisEntity) {
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
