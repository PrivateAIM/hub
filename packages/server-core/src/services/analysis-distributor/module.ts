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
    AnalysisNodeEntity,
    useDataSourceSync,
} from '../../database';
import { RequestRepositoryAdapter } from '../../http/request';

export class AnalysisDistributor {
    protected repository: Repository<AnalysisEntity>;

    protected analysisNodeRepository: Repository<AnalysisNodeEntity>;

    protected caller : AnalysisDistributorComponentCaller;

    constructor() {
        const dataSource = useDataSourceSync();

        this.repository = dataSource.getRepository(AnalysisEntity);
        this.analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);

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

        await this.caller.callExecute({
            id: entity.id,
        });

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
