/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Analysis, AnalysisNode, Registry } from '@privateaim/core-kit';
import { AnalysisDistributorCommandChecker } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { EntityPersistContext, IEntityRepository } from '../../entities/types.ts';
import type { IAnalysisMetadataCaller } from '../analysis-builder/types.ts';
import type { IAnalysisDistributorCaller } from './types.ts';

type AnalysisDistributorContext = {
    repository: IEntityRepository<Analysis>;
    analysisNodeRepository: IEntityRepository<AnalysisNode>;
    registryRepository: IEntityRepository<Registry>;
    caller: IAnalysisDistributorCaller;
    metadataCaller: IAnalysisMetadataCaller;
};

export class AnalysisDistributor {
    protected repository: IEntityRepository<Analysis>;

    protected analysisNodeRepository: IEntityRepository<AnalysisNode>;

    protected registryRepository: IEntityRepository<Registry>;

    protected caller: IAnalysisDistributorCaller;

    protected metadataCaller: IAnalysisMetadataCaller;

    constructor(ctx: AnalysisDistributorContext) {
        this.repository = ctx.repository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.registryRepository = ctx.registryRepository;
        this.caller = ctx.caller;
        this.metadataCaller = ctx.metadataCaller;
    }

    async start(input: string | Analysis, persistCtx?: EntityPersistContext) {
        const entityId = typeof input === 'string' ? input : input.id;
        const entity = await this.metadataCaller.callRecalcDirect({ analysisId: entityId });

        AnalysisDistributorCommandChecker.canStart(entity);

        await this.assignRegistry(entity);
        await this.checkNodes(entity);

        entity.distribution_status = ProcessStatus.STARTING;

        await this.repository.save(entity, persistCtx);
        await this.caller.callExecute({ id: entity.id });

        return entity;
    }

    async check(input: string | Analysis) {
        const entity = await this.resolve(input);
        AnalysisDistributorCommandChecker.canCheck(entity);
        await this.caller.callCheck({ id: entity.id });
        return entity;
    }

    protected async assignRegistry(entity: Analysis) {
        if (!entity.registry_id) {
            const registries = await this.registryRepository.findManyBy({});
            const registry = registries[0];

            if (!registry) {
                throw new BadRequestError('No docker registry is defined.');
            }

            entity.registry_id = registry.id;
        }

        return entity;
    }

    protected async checkNodes(entity: Analysis) {
        const analysisNodes = await this.analysisNodeRepository.findManyBy({ analysis_id: entity.id });

        for (const analysisNode of analysisNodes) {
            if (
                (analysisNode as any).node &&
                !(analysisNode as any).node.registry_id
            ) {
                throw new BadRequestError(`The node ${(analysisNode as any).node.name} is not assigned to a registry yet.`);
            }
        }
    }

    protected async resolve(input: string | Analysis): Promise<Analysis> {
        if (typeof input === 'string') {
            const entity = await this.repository.findOneById(input);
            if (!entity) {
                throw new BadRequestError('Analysis could not be found.');
            }
            return entity;
        }
        return input;
    }
}
