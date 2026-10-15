/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityNotFoundError } from '@privateaim/errors';
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisBuilderCommandChecker, NodeType } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { IAnalysisMetadataRecalculator, IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeMetadataRecalculator, IAnalysisNodeRepository } from '../../entities/analysis-node/types.ts';
import type { IAnalysisFileMetadataRecalculator } from '../../entities/analysis-bucket-file/types.ts';
import type { AnalysisBuilderStartOptions, IAnalysisBuilderCaller } from './types.ts';

type AnalysisBuilderContext = {
    repository: IAnalysisRepository;
    analysisNodeRepository: IAnalysisNodeRepository;
    caller: IAnalysisBuilderCaller;
    analysisRecalculator: IAnalysisMetadataRecalculator;
    nodeRecalculator: IAnalysisNodeMetadataRecalculator;
    fileRecalculator: IAnalysisFileMetadataRecalculator;
};

export class AnalysisBuilder {
    protected repository: IAnalysisRepository;

    protected analysisNodeRepository: IAnalysisNodeRepository;

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
        const entity = await this.fileRecalculator.recalc(entityId);

        // early, so approvals are not reset for a build that cannot start
        AnalysisBuilderCommandChecker.canStart(entity);

        if (!options.ignoreApproval) {
            await this.resetApprovals(entityId);
            await this.nodeRecalculator.recalc(entityId);
        }

        // checked again on the locked row: a concurrent start (another
        // replica) may have moved the status since the read above.
        const started = await this.repository.updateLocked(entityId, (locked) => {
            AnalysisBuilderCommandChecker.canStart(locked);

            locked.buildStatus = ProcessStatus.STARTING;
            locked.buildProgress = null;
            return true;
        }, options.persistCtx);

        if (!started) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        await this.caller.callExecute({ id: started.id });

        return started;
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
        // The node relation tells an aggregator apart; a plain findManyBy
        // leaves it unloaded, which would clear the aggregator's approval too.
        const analysisNodes = await this.analysisNodeRepository.findManyWithNodeByAnalysis(analysisId);

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
