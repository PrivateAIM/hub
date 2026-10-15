/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityNotFoundError } from '@privateaim/errors';
import type { Analysis, AnalysisNode } from '@privateaim/core-kit';
import { AnalysisBuilderCommandChecker, NodeType } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { IEntityRepository } from '@privateaim/server-kit';
import type { IAnalysisMetadataRecalculator } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeMetadataRecalculator } from '../../entities/analysis-node/types.ts';
import type { IAnalysisFileMetadataRecalculator } from '../../entities/analysis-bucket-file/types.ts';
import type { AnalysisBuilderStartOptions, IAnalysisBuilderCaller } from './types.ts';

type AnalysisBuilderContext = {
    repository: IEntityRepository<Analysis>;
    analysisNodeRepository: IEntityRepository<AnalysisNode>;
    caller: IAnalysisBuilderCaller;
    analysisRecalculator: IAnalysisMetadataRecalculator;
    nodeRecalculator: IAnalysisNodeMetadataRecalculator;
    fileRecalculator: IAnalysisFileMetadataRecalculator;
};

export class AnalysisBuilder {
    protected repository: IEntityRepository<Analysis>;

    protected analysisNodeRepository: IEntityRepository<AnalysisNode>;

    protected caller: IAnalysisBuilderCaller;

    protected analysisRecalculator: IAnalysisMetadataRecalculator;

    protected nodeRecalculator: IAnalysisNodeMetadataRecalculator;

    protected fileRecalculator: IAnalysisFileMetadataRecalculator;

    constructor(ctx: AnalysisBuilderContext) {
        this.repository = ctx.repository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.caller = ctx.caller;
        this.analysisRecalculator = ctx.analysisRecalculator;
        this.nodeRecalculator = ctx.nodeRecalculator;
        this.fileRecalculator = ctx.fileRecalculator;
    }

    async start(input: string | Analysis, options: AnalysisBuilderStartOptions = {}) {
        const entityId = typeof input === 'string' ? input : input.id;

        await this.analysisRecalculator.recalc(entityId);
        await this.nodeRecalculator.recalc(entityId);
        let entity = await this.fileRecalculator.recalc(entityId);

        AnalysisBuilderCommandChecker.canStart(entity);

        if (!options.ignoreApproval) {
            await this.resetApprovals(entityId);
            entity = await this.nodeRecalculator.recalc(entityId);
        }

        entity.buildStatus = ProcessStatus.STARTING;
        entity.buildProgress = null;

        await this.repository.save(entity, options.persistCtx);
        await this.caller.callExecute({ id: entity.id });

        return entity;
    }

    async check(input: string | Analysis) {
        const entity = await this.resolve(input);
        AnalysisBuilderCommandChecker.canCheck(entity);
        await this.caller.callCheck({ id: entity.id });
        return entity;
    }

    /**
     * Nodes approve the built image, not the code, so an approval given for a
     * previous image must not let a new one through distribution.
     */
    protected async resetApprovals(analysisId: string) {
        const analysisNodes = await this.analysisNodeRepository.findManyBy({ analysisId });

        for (const analysisNode of analysisNodes) {
            if (
                (analysisNode.node && analysisNode.node.type === NodeType.AGGREGATOR) ||
                analysisNode.approvalStatus === null
            ) {
                continue;
            }

            analysisNode.approvalStatus = null;
            await this.analysisNodeRepository.save(analysisNode);
        }
    }

    protected async resolve(input: string | Analysis): Promise<Analysis> {
        if (typeof input === 'string') {
            const entity = await this.repository.findOneById(input);
            if (!entity) {
                throw new EntityNotFoundError({ entity: 'analysis' });
            }
            return entity;
        }
        return input;
    }
}
