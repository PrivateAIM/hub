/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import type { Analysis, AnalysisNode } from '@privateaim/core-kit';
import { AnalysisConfiguratorCommandChecker, NodeType } from '@privateaim/core-kit';
import type { IEntityRepository } from '../../entities/types.ts';
import type { IAnalysisMetadataRecalculator } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeMetadataRecalculator } from '../../entities/analysis-node/types.ts';
import type { IAnalysisFileMetadataRecalculator } from '../../entities/analysis-bucket-file/types.ts';
import type { AnalysisConfiguratorLockOptions, AnalysisConfiguratorUnlockOptions } from './types.ts';

type AnalysisConfiguratorContext = {
    repository: IEntityRepository<Analysis>;
    analysisNodeRepository: IEntityRepository<AnalysisNode>;
    analysisRecalculator: IAnalysisMetadataRecalculator;
    nodeRecalculator: IAnalysisNodeMetadataRecalculator;
    fileRecalculator: IAnalysisFileMetadataRecalculator;
};

export class AnalysisConfigurator {
    protected repository: IEntityRepository<Analysis>;

    protected analysisNodeRepository: IEntityRepository<AnalysisNode>;

    protected analysisRecalculator: IAnalysisMetadataRecalculator;

    protected nodeRecalculator: IAnalysisNodeMetadataRecalculator;

    protected fileRecalculator: IAnalysisFileMetadataRecalculator;

    constructor(ctx: AnalysisConfiguratorContext) {
        this.repository = ctx.repository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.analysisRecalculator = ctx.analysisRecalculator;
        this.nodeRecalculator = ctx.nodeRecalculator;
        this.fileRecalculator = ctx.fileRecalculator;
    }

    async lock(
        input: string | Analysis,
        options: AnalysisConfiguratorLockOptions = {},
    ): Promise<Analysis> {
        const entityId = typeof input === 'string' ? input : input.id;

        await this.analysisRecalculator.recalc(entityId);
        await this.nodeRecalculator.recalc(entityId);
        const entity = await this.fileRecalculator.recalc(entityId);

        AnalysisConfiguratorCommandChecker.canLock(entity);

        entity.configuration_locked = true;

        await this.repository.save(entity, options.persistCtx);

        return entity;
    }

    async unlock(
        input: string | Analysis,
        options: AnalysisConfiguratorUnlockOptions = {},
    ): Promise<Analysis> {
        const entity = await this.resolve(input);

        AnalysisConfiguratorCommandChecker.canUnlock(entity);

        const analysisNodes = await this.analysisNodeRepository.findManyBy({ analysis_id: entity.id });

        for (const analysisNode of analysisNodes) {
            if (
                analysisNode.node &&
                analysisNode.node.type === NodeType.AGGREGATOR
            ) {
                continue;
            }

            if (!options.ignoreApproval) {
                analysisNode.approval_status = null;
            }

            await this.analysisNodeRepository.save(analysisNode);
        }

        entity.configuration_locked = false;
        entity.build_status = null;

        await this.repository.save(entity, options.persistCtx);

        return this.nodeRecalculator.recalc(entity.id);
    }

    protected async resolve(input: string | Analysis): Promise<Analysis> {
        if (typeof input === 'string') {
            const entity = await this.repository.findOneById(input);
            if (!entity) {
                throw new NotFoundError('Analysis could not be found.');
            }
            return entity;
        }
        return input;
    }
}
